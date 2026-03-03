#!/usr/bin/env node
/**
 * Chat History Search - 高效搜索群聊历史记录
 * 
 * 用法:
 *   node search-chat-history.mjs --chat-id=oc_xxx --after="2026-03-03 08:00"
 *   node search-chat-history.mjs --chat-id=oc_xxx --keyword="任务"
 *   node search-chat-history.mjs --chat-id=oc_xxx --sender="ou_xxx"
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const WORKSPACE = join(homedir(), '.openclaw/workspace');

function parseArgs() {
    const args = {
        chatId: null,
        after: null,
        before: null,
        keywords: [],
        sender: null,
        limit: 100
    };
    
    process.argv.slice(2).forEach(arg => {
        if (arg.startsWith('--chat-id=')) {
            args.chatId = arg.split('=')[1];
        } else if (arg.startsWith('--after=')) {
            args.after = parseTime(arg.split('=')[1]);
        } else if (arg.startsWith('--before=')) {
            args.before = parseTime(arg.split('=')[1]);
        } else if (arg.startsWith('--keyword=')) {
            args.keywords.push(arg.split('=')[1]);
        } else if (arg.startsWith('--sender=')) {
            args.sender = arg.split('=')[1];
        } else if (arg.startsWith('--limit=')) {
            args.limit = parseInt(arg.split('=')[1]);
        }
    });
    
    return args;
}

function parseTime(timeStr) {
    // 相对时间
    if (timeStr.endsWith('h')) {
        const hours = parseInt(timeStr);
        return Date.now() - hours * 60 * 60 * 1000;
    }
    if (timeStr.endsWith('d')) {
        const days = parseInt(timeStr);
        return Date.now() - days * 24 * 60 * 60 * 1000;
    }
    if (timeStr === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.getTime();
    }
    if (timeStr === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        return yesterday.getTime();
    }
    
    // 绝对时间 - 假设是 Asia/Shanghai 时区
    const date = new Date(timeStr);
    // 如果没有指定时区，假设是本地时间（Asia/Shanghai）
    return date.getTime();
}

function formatTimestamp(ts) {
    const date = new Date(parseInt(ts));
    return date.toISOString().replace('T', ' ').substring(0, 19);
}

function extractContent(message) {
    if (!message.body || !message.body.content) return '[无内容]';
    
    try {
        const content = JSON.parse(message.body.content);
        return content.text || content.title || content.template || '[富文本/图片]';
    } catch (err) {
        return message.body.content;
    }
}

function searchMessages(chatId, filters) {
    const messagesPath = join(WORKSPACE, 'chats', chatId, 'archive', 'messages.jsonl');
    const contextPath = join(WORKSPACE, 'chats', chatId, 'context.yaml');
    
    if (!existsSync(messagesPath)) {
        console.error(`错误: 找不到聊天记录文件: ${messagesPath}`);
        process.exit(1);
    }
    
    // 读取context获取群名
    let chatName = chatId;
    if (existsSync(contextPath)) {
        const context = readFileSync(contextPath, 'utf-8');
        const nameMatch = context.match(/chat_name:\s*"?([^"\n]+)"?/);
        if (nameMatch) chatName = nameMatch[1];
    }
    
    // 读取所有消息
    const lines = readFileSync(messagesPath, 'utf-8').split('\n').filter(Boolean);
    const messages = lines.map(line => JSON.parse(line));
    
    // 应用筛选条件
    let filtered = messages;
    
    if (filters.after) {
        filtered = filtered.filter(msg => parseInt(msg.create_time) >= filters.after);
    }
    
    if (filters.before) {
        filtered = filtered.filter(msg => parseInt(msg.create_time) <= filters.before);
    }
    
    if (filters.sender) {
        filtered = filtered.filter(msg => msg.sender && msg.sender.id === filters.sender);
    }
    
    if (filters.keywords.length > 0) {
        filtered = filtered.filter(msg => {
            const content = extractContent(msg).toLowerCase();
            return filters.keywords.every(kw => content.includes(kw.toLowerCase()));
        });
    }
    
    // 限制数量
    if (filters.limit) {
        filtered = filtered.slice(-filters.limit);
    }
    
    // 格式化输出
    const result = {
        total: filtered.length,
        chat_id: chatId,
        chat_name: chatName,
        time_range: {
            start: filters.after ? formatTimestamp(filters.after) : null,
            end: filters.before ? formatTimestamp(filters.before) : null
        },
        messages: filtered.map(msg => ({
            timestamp: formatTimestamp(msg.create_time),
            timestamp_ms: parseInt(msg.create_time),
            sender: msg.sender ? msg.sender.id : 'system',
            content: extractContent(msg),
            message_id: msg.message_id
        }))
    };
    
    return result;
}

function main() {
    const args = parseArgs();
    
    if (!args.chatId) {
        console.error('错误: 缺少 --chat-id 参数');
        console.error('用法: node search-chat-history.mjs --chat-id=oc_xxx [options]');
        process.exit(1);
    }
    
    const result = searchMessages(args.chatId, args);
    console.log(JSON.stringify(result, null, 2));
}

main();
