#!/usr/bin/env node
/**
 * 群聊项目记忆刷新脚本
 * 扫描所有群聊，检查需要更新的项目，运行深度分析并更新 README.md
 * 
 * 用法: node refresh-chat-memory.mjs [--force] [--chat-id=xxx]
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';

const WORKSPACE = join(homedir(), '.openclaw/workspace');
const CHATS_DIR = join(WORKSPACE, 'chats');
const FORCE = process.argv.includes('--force');
const CHAT_ID_ARG = process.argv.find(arg => arg.startsWith('--chat-id='));
const TARGET_CHAT_ID = CHAT_ID_ARG ? CHAT_ID_ARG.split('=')[1] : null;

const MESSAGE_THRESHOLD = 50; // 新消息数量阈值
const DAYS_THRESHOLD = 7; // 天数阈值

// 读取 README.md 的最后更新时间
function getLastUpdateTime(readmePath) {
    if (!existsSync(readmePath)) return 0;
    
    try {
        const content = readFileSync(readmePath, 'utf-8');
        const match = content.match(/最后更新: (\d{4}-\d{2}-\d{2})/);
        if (match) {
            return new Date(match[1]).getTime();
        }
    } catch (err) {
        console.error(`读取 ${readmePath} 失败:`, err.message);
    }
    
    return 0;
}

// 统计新消息数量
function countNewMessages(messagesPath, lastUpdateTime) {
    if (!existsSync(messagesPath)) return 0;
    
    try {
        const lines = readFileSync(messagesPath, 'utf-8').split('\n').filter(Boolean);
        let count = 0;
        
        for (const line of lines) {
            try {
                const msg = JSON.parse(line);
                const msgTime = msg.create_time ? parseInt(msg.create_time) : 0;
                if (msgTime > lastUpdateTime) count++;
            } catch {}
        }
        
        return count;
    } catch (err) {
        console.error(`读取 ${messagesPath} 失败:`, err.message);
        return 0;
    }
}

// 检查是否需要更新
function needsUpdate(chatId, projectName) {
    const readmePath = join(CHATS_DIR, chatId, 'projects', projectName, 'README.md');
    const messagesPath = join(CHATS_DIR, chatId, 'archive', 'messages.jsonl');
    
    if (FORCE) return { needed: true, reason: '强制更新' };
    
    const lastUpdateTime = getLastUpdateTime(readmePath);
    const daysSinceUpdate = (Date.now() - lastUpdateTime) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > DAYS_THRESHOLD) {
        return { needed: true, reason: `距离上次更新 ${Math.floor(daysSinceUpdate)} 天` };
    }
    
    const newMessages = countNewMessages(messagesPath, lastUpdateTime);
    if (newMessages > MESSAGE_THRESHOLD) {
        return { needed: true, reason: `有 ${newMessages} 条新消息` };
    }
    
    return { needed: false, reason: '无需更新' };
}

// 运行深度分析
function runDeepAnalysis(chatId, projectName) {
    const scriptPath = join(WORKSPACE, 'scripts', 'deep-analyze-project.mjs');
    const cmd = `node "${scriptPath}" "${chatId}" "${projectName}"`;
    
    try {
        execSync(cmd, { stdio: 'inherit' });
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// 更新 README.md 的时间戳
function updateTimestamp(readmePath) {
    if (!existsSync(readmePath)) return;
    
    try {
        let content = readFileSync(readmePath, 'utf-8');
        const today = new Date().toISOString().split('T')[0];
        
        if (content.includes('最后更新:')) {
            content = content.replace(/最后更新: \d{4}-\d{2}-\d{2}/, `最后更新: ${today}`);
        } else {
            // 在第一个标题后添加时间戳
            content = content.replace(/^(# .+\n)/, `$1\n最后更新: ${today}\n`);
        }
        
        writeFileSync(readmePath, content, 'utf-8');
    } catch (err) {
        console.error(`更新时间戳失败:`, err.message);
    }
}

async function main() {
    console.log('🔄 群聊项目记忆刷新\n');
    
    if (!existsSync(CHATS_DIR)) {
        console.log('❌ chats/ 目录不存在');
        return;
    }
    
    const chatIds = readdirSync(CHATS_DIR).filter(name => {
        const path = join(CHATS_DIR, name);
        return statSync(path).isDirectory() && name.startsWith('oc_');
    });
    
    if (TARGET_CHAT_ID) {
        if (!chatIds.includes(TARGET_CHAT_ID)) {
            console.log(`❌ 找不到群聊: ${TARGET_CHAT_ID}`);
            return;
        }
        console.log(`🎯 只处理群聊: ${TARGET_CHAT_ID}\n`);
    }
    
    const results = {
        updated: [],
        skipped: [],
        errors: []
    };
    
    for (const chatId of chatIds) {
        if (TARGET_CHAT_ID && chatId !== TARGET_CHAT_ID) continue;
        
        const projectsDir = join(CHATS_DIR, chatId, 'projects');
        if (!existsSync(projectsDir)) continue;
        
        const projects = readdirSync(projectsDir).filter(name => {
            const path = join(projectsDir, name);
            return statSync(path).isDirectory();
        });
        
        for (const projectName of projects) {
            const check = needsUpdate(chatId, projectName);
            
            if (!check.needed) {
                results.skipped.push({ chatId, projectName, reason: check.reason });
                console.log(`⏭️  ${chatId}/${projectName}: ${check.reason}`);
                continue;
            }
            
            console.log(`🔄 ${chatId}/${projectName}: ${check.reason}`);
            
            const result = runDeepAnalysis(chatId, projectName);
            
            if (result.success) {
                const readmePath = join(projectsDir, projectName, 'README.md');
                updateTimestamp(readmePath);
                results.updated.push({ chatId, projectName, reason: check.reason });
                console.log(`✅ ${chatId}/${projectName}: 更新完成`);
            } else {
                results.errors.push({ chatId, projectName, error: result.error });
                console.log(`❌ ${chatId}/${projectName}: ${result.error}`);
            }
        }
    }
    
    console.log('\n📊 刷新结果:');
    console.log(`  更新: ${results.updated.length} 个项目`);
    console.log(`  跳过: ${results.skipped.length} 个项目`);
    console.log(`  错误: ${results.errors.length} 个项目`);
    
    if (results.updated.length > 0) {
        console.log('\n✅ 更新的项目:');
        results.updated.forEach(({ chatId, projectName, reason }) => {
            console.log(`  - ${chatId}/${projectName} (${reason})`);
        });
    }
    
    if (results.errors.length > 0) {
        console.log('\n❌ 错误:');
        results.errors.forEach(({ chatId, projectName, error }) => {
            console.log(`  - ${chatId}/${projectName}: ${error}`);
        });
    }
}

main().catch(err => {
    console.error('错误:', err.message);
    process.exit(1);
});
