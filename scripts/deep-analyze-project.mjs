#!/usr/bin/env node
/**
 * 深度分析项目聊天记录，提取目标、任务、决策等信息
 * 用法: node deep-analyze-project.mjs <chat_id> <project_name>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const WORKSPACE = join(homedir(), '.openclaw/workspace');
const CHAT_ID = process.argv[2];
const PROJECT_NAME = process.argv[3];

if (!CHAT_ID || !PROJECT_NAME) {
    console.error('用法: node deep-analyze-project.mjs <chat_id> <project_name>');
    process.exit(1);
}

const CHAT_DIR = join(WORKSPACE, 'chats', CHAT_ID);
const MESSAGES_FILE = join(CHAT_DIR, 'archive/messages.jsonl');
const PROJECT_DIR = join(CHAT_DIR, 'projects', PROJECT_NAME);

// 读取消息
function readMessages() {
    const lines = readFileSync(MESSAGES_FILE, 'utf-8').split('\n').filter(l => l.trim());
    return lines.map(line => JSON.parse(line));
}

// 提取文本内容
function extractText(message) {
    try {
        const content = JSON.parse(message.body?.content || '{}');
        return content.text || '';
    } catch {
        return '';
    }
}

// 识别目标（包含"目标"、"要做"、"计划"等关键词的句子）
function extractGoals(messages, projectKeywords) {
    const goalIndicators = ['目标', '要做', '计划', '需要', '实现', 'goal', 'plan', 'todo'];
    const goals = [];
    
    for (const msg of messages) {
        const text = extractText(msg);
        const lowerText = text.toLowerCase();
        
        // 检查是否包含项目关键词
        const hasProjectKeyword = projectKeywords.some(kw => lowerText.includes(kw.toLowerCase()));
        if (!hasProjectKeyword) continue;
        
        // 检查是否包含目标指示词
        const hasGoalIndicator = goalIndicators.some(ind => text.includes(ind));
        if (!hasGoalIndicator) continue;
        
        // 提取句子（简单处理：按句号分割）
        const sentences = text.split(/[。！？\n]/).filter(s => s.trim().length > 10);
        for (const sentence of sentences) {
            if (goalIndicators.some(ind => sentence.includes(ind)) && sentence.length < 200) {
                goals.push({
                    text: sentence.trim(),
                    time: new Date(parseInt(msg.create_time)).toISOString().split('T')[0],
                    sender: msg.sender?.id
                });
            }
        }
    }
    
    return goals.slice(-10); // 返回最近 10 个目标
}

// 识别任务（包含动词的句子）
function extractTasks(messages, projectKeywords) {
    const taskVerbs = ['做', '完成', '修改', '添加', '删除', '检查', '测试', '部署', '发布', '优化', '修复', '实现'];
    const tasks = [];
    
    for (const msg of messages.slice(-500)) { // 只看最近 500 条
        const text = extractText(msg);
        const lowerText = text.toLowerCase();
        
        // 检查是否包含项目关键词
        const hasProjectKeyword = projectKeywords.some(kw => lowerText.includes(kw.toLowerCase()));
        if (!hasProjectKeyword) continue;
        
        // 检查是否包含任务动词
        const hasTaskVerb = taskVerbs.some(verb => text.includes(verb));
        if (!hasTaskVerb) continue;
        
        if (text.length < 200) {
            tasks.push({
                text: text.substring(0, 100),
                time: new Date(parseInt(msg.create_time)).toISOString().split('T')[0],
                sender: msg.sender?.id
            });
        }
    }
    
    return tasks.slice(-20); // 返回最近 20 个任务
}

// 识别技术栈（包含技术关键词）
function extractTechStack(messages, projectKeywords) {
    const techKeywords = [
        'python', 'javascript', 'node', 'react', 'vue', 'api', 'database', 'mysql', 'redis',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'github', 'gitlab',
        'fastapi', 'flask', 'django', 'express', 'nest',
        'ffmpeg', 'opencv', 'tensorflow', 'pytorch'
    ];
    
    const techMentions = {};
    
    for (const msg of messages) {
        const text = extractText(msg).toLowerCase();
        
        // 检查是否包含项目关键词
        const hasProjectKeyword = projectKeywords.some(kw => text.includes(kw.toLowerCase()));
        if (!hasProjectKeyword) continue;
        
        for (const tech of techKeywords) {
            if (text.includes(tech)) {
                techMentions[tech] = (techMentions[tech] || 0) + 1;
            }
        }
    }
    
    // 返回提及次数 > 3 的技术
    return Object.entries(techMentions)
        .filter(([_, count]) => count > 3)
        .sort((a, b) => b[1] - a[1])
        .map(([tech, count]) => ({ tech, mentions: count }));
}

// 识别关键决策（包含"决定"、"选择"等关键词）
function extractDecisions(messages, projectKeywords) {
    const decisionIndicators = ['决定', '选择', '采用', '使用', '改用', 'decide', 'choose', 'use'];
    const decisions = [];
    
    for (const msg of messages) {
        const text = extractText(msg);
        const lowerText = text.toLowerCase();
        
        // 检查是否包含项目关键词
        const hasProjectKeyword = projectKeywords.some(kw => lowerText.includes(kw.toLowerCase()));
        if (!hasProjectKeyword) continue;
        
        // 检查是否包含决策指示词
        const hasDecisionIndicator = decisionIndicators.some(ind => text.includes(ind));
        if (!hasDecisionIndicator) continue;
        
        if (text.length < 300) {
            decisions.push({
                text: text.substring(0, 150),
                time: new Date(parseInt(msg.create_time)).toISOString().split('T')[0],
                sender: msg.sender?.id
            });
        }
    }
    
    return decisions.slice(-10); // 返回最近 10 个决策
}

async function main() {
    console.log(`深度分析项目: ${PROJECT_NAME} (群聊: ${CHAT_ID})`);
    
    const messages = readMessages();
    console.log(`读取 ${messages.length} 条消息`);
    
    // 项目关键词（根据项目名称推断）
    const projectKeywordMap = {
        'yingshi-taifeng': ['影视台风', '台风', '视频', '剪辑', 'pipeline'],
        'amz-listing': ['listing', 'amazon', '亚马逊', 'product'],
        'nowmi': ['nowmi', 'NOWMI'],
        'credex': ['credex', 'CredEX', 'pitch'],
        'ai-manju': ['漫剧', '漫画', 'comic'],
        'yibi': ['异璧', '行政', '合同', '报价']
    };
    
    const projectKeywords = projectKeywordMap[PROJECT_NAME] || PROJECT_NAME.split('-');
    console.log(`项目关键词: ${projectKeywords.join(', ')}`);
    
    const goals = extractGoals(messages, projectKeywords);
    const tasks = extractTasks(messages, projectKeywords);
    const techStack = extractTechStack(messages, projectKeywords);
    const decisions = extractDecisions(messages, projectKeywords);
    
    const analysis = {
        project_name: PROJECT_NAME,
        chat_id: CHAT_ID,
        analysis_time: new Date().toISOString(),
        goals: goals,
        tasks: tasks,
        tech_stack: techStack,
        decisions: decisions
    };
    
    // 保存分析结果
    const outputFile = join(PROJECT_DIR, 'deep-analysis.json');
    writeFileSync(outputFile, JSON.stringify(analysis, null, 2));
    
    console.log('\n分析结果:');
    console.log(`目标: ${goals.length} 个`);
    console.log(`任务: ${tasks.length} 个`);
    console.log(`技术栈: ${techStack.length} 项`);
    console.log(`决策: ${decisions.length} 个`);
    console.log(`\n结果已保存: ${outputFile}`);
}

main().catch(err => {
    console.error('错误:', err.message);
    process.exit(1);
});
