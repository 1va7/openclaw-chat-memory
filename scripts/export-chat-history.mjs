#!/usr/bin/env node
/**
 * 导出飞书群聊历史记录
 * 用法: node export-chat-history.mjs <chat_id> <output_file> [app_id] [app_secret]
 */

import { writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { dirname } from 'path';

const CHAT_ID = process.argv[2];
const OUTPUT_FILE = process.argv[3];
const APP_ID = process.argv[4] || process.env.FEISHU_APP_ID;
const APP_SECRET = process.argv[5] || process.env.FEISHU_APP_SECRET;

if (!CHAT_ID || !OUTPUT_FILE) {
    console.error('用法: node export-chat-history.mjs <chat_id> <output_file> [app_id] [app_secret]');
    console.error('或设置环境变量: FEISHU_APP_ID, FEISHU_APP_SECRET');
    process.exit(1);
}

if (!APP_ID || !APP_SECRET) {
    console.error('错误: 缺少 APP_ID 或 APP_SECRET');
    console.error('请通过参数或环境变量提供');
    process.exit(1);
}

// 获取 tenant_access_token
async function getTenantAccessToken() {
    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
    });
    
    const data = await response.json();
    if (data.code !== 0) {
        throw new Error(`获取 token 失败: ${data.msg}`);
    }
    
    return data.tenant_access_token;
}

// 获取群信息
async function getChatInfo(token, chatId) {
    const response = await fetch(`https://open.feishu.cn/open-apis/im/v1/chats/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    return data;
}

// 获取聊天记录
async function getMessages(token, chatId, pageToken = null) {
    const url = new URL('https://open.feishu.cn/open-apis/im/v1/messages');
    url.searchParams.set('container_id_type', 'chat');
    url.searchParams.set('container_id', chatId);
    url.searchParams.set('page_size', '50'); // 减小 page_size，避免超时
    if (pageToken) {
        url.searchParams.set('page_token', pageToken);
    }
    
    const response = await fetch(url, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    if (data.code !== 0) {
        console.error('API 错误详情:', JSON.stringify(data, null, 2));
        throw new Error(`获取消息失败: ${data.msg} (code: ${data.code})`);
    }
    
    return data.data;
}

async function main() {
    console.log(`开始导出群聊: ${CHAT_ID}`);
    console.log(`输出文件: ${OUTPUT_FILE}`);
    
    // 创建输出目录
    const outputDir = dirname(OUTPUT_FILE);
    mkdirSync(outputDir, { recursive: true });
    
    // 获取 token
    console.log('获取 access token...');
    const token = await getTenantAccessToken();
    
    // 获取群信息
    console.log('获取群信息...');
    const chatInfo = await getChatInfo(token, CHAT_ID);
    
    // 保存群信息
    const chatInfoFile = OUTPUT_FILE.replace('.jsonl', '_info.json');
    writeFileSync(chatInfoFile, JSON.stringify(chatInfo, null, 2));
    console.log(`群信息已保存: ${chatInfoFile}`);
    
    // 获取消息
    console.log('开始获取消息...');
    let pageToken = null;
    let totalMessages = 0;
    let pageCount = 0;
    
    // 清空输出文件
    writeFileSync(OUTPUT_FILE, '');
    
    do {
        pageCount++;
        console.log(`获取第 ${pageCount} 页...`);
        
        const result = await getMessages(token, CHAT_ID, pageToken);
        const messages = result.items || [];
        
        // 写入消息
        for (const msg of messages) {
            appendFileSync(OUTPUT_FILE, JSON.stringify(msg) + '\n');
            totalMessages++;
        }
        
        pageToken = result.page_token;
        console.log(`已获取 ${totalMessages} 条消息`);
        
        // 避免触发 API 限流
        if (pageToken) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    } while (pageToken);
    
    console.log(`\n✅ 导出完成！`);
    console.log(`总消息数: ${totalMessages}`);
    console.log(`输出文件: ${OUTPUT_FILE}`);
}

main().catch(err => {
    console.error('❌ 错误:', err.message);
    process.exit(1);
});
