/**
 * AI Service
 * Handles AI API integration and chat functionality
 */

class AIService {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://portal.2brain.ai/api/bot/chat/v1';
        this.isInitialized = false;
        this.language = 'zh-CN';
        this.config = window.CONFIG?.api?.aiService;
        
        this.init();
    }

    /**
     * Initialize AI service
     */
    async init() {
        try {
            console.log('🤖 Initializing AI Service...');
            
            if (!this.config) {
                console.warn('⚠️ AI service config not found, using defaults');
                this.config = {
                    baseUrl: this.baseUrl,
                    model: 'gpt-4',
                    maxTokens: 2000,
                    temperature: 0.7,
                    timeout: 30000,
                    apiKey: '2B-Gkl2EqlkO1xHAwnRkRIjEmd129zAKUKXLhlj5nO516jtl5xhmx'
                };
            }

            this.baseUrl = this.config.baseUrl || this.baseUrl;
            
            // Try to get API key from various sources
            this.apiKey = this.getApiKey();
            
            // Fallback: use hardcoded API key if not found elsewhere
            if (!this.apiKey) {
                console.log('🔧 Using fallback API key...');
                this.apiKey = '2B-Gkl2EqlkO1xHAwnRkRIjEmd129zAKUKXLhlj5nO516jtl5xhmx';
            }
            
            if (!this.apiKey) {
                console.warn('⚠️ AI API key not available - some features may be limited');
            } else {
                console.log('✅ AI API key loaded:', this.apiKey.substring(0, 10) + '...');
            }

            this.isInitialized = true;
            console.log('✅ AI Service initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize AI Service:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Get API key from various sources
     */
    getApiKey() {
        console.log('🔍 Checking API key sources...');
        
        // Try different sources for API key
        if (typeof window.getApiKey === 'function') {
            console.log('📍 Found window.getApiKey function');
            return window.getApiKey();
        }
        
        if (window.CONFIG?.api?.aiService?.apiKey) {
            console.log('📍 Found API key in CONFIG:', window.CONFIG.api.aiService.apiKey.substring(0, 10) + '...');
            return window.CONFIG.api.aiService.apiKey;
        }
        
        // Check config object
        if (this.config?.apiKey) {
            console.log('📍 Found API key in this.config:', this.config.apiKey.substring(0, 10) + '...');
            return this.config.apiKey;
        }
        
        // Check localStorage
        const storedKey = localStorage.getItem('ai_api_key');
        if (storedKey) {
            console.log('📍 Found API key in localStorage:', storedKey.substring(0, 10) + '...');
            return storedKey;
        }
        
        console.log('⚠️ No API key found in any source, will use fallback');
        return null;
    }

    /**
     * Set API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('ai_api_key', apiKey);
        console.log('✅ AI API key updated');
    }

    /**
     * Set language preference
     */
    setLanguage(language) {
        this.language = language || 'zh-CN';
        localStorage.setItem('ai_language', this.language);
        console.log('✅ AI language set to:', this.language);
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.language || localStorage.getItem('ai_language') || 'zh-CN';
    }

    /**
     * Get current provider
     */
    getCurrentProvider() {
        return '2brain AI';
    }

    /**
     * Test API connection
     */
    async testConnection() {
        try {
            console.log('🔍 Testing AI API connection...');
            
            if (!this.apiKey) {
                throw new Error('API key not available');
            }

            const response = await this.makeRequest('/chat/completions', {
                messages: [
                    { role: 'user', content: 'Hello, this is a connection test.' }
                ],
                stream: false
            });

            console.log('✅ AI API connection successful');
            return { success: true, response };
            
        } catch (error) {
            console.error('❌ AI API connection failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send chat message to AI
     */
    async sendMessage(message, context = []) {
        try {
            if (!this.isInitialized) {
                throw new Error('AI Service not initialized');
            }

            if (!this.apiKey) {
                throw new Error('API key not available');
            }

            console.log('💬 Sending message to AI:', message.substring(0, 50) + '...');

            const messages = [
                {
                    role: 'system',
                    content: `你是一个专业的升学顾问AI助手，专门帮助学生进行大学申请规划。你有以下特点：
1. 专业知识丰富：熟悉全球各大教育体系（中国高考、IB、A-Level、AP、SAT等）
2. 个性化建议：根据学生的具体情况提供定制化的升学规划
3. 实用性强：提供具体可行的建议和行动计划
4. 鼓励性：以积极正面的态度激励学生
5. 全面性：涵盖学术、课外活动、申请材料等各方面

请用中文回答，语言要专业但易懂，结构要清晰有条理。`
                },
                ...context,
                { role: 'user', content: message }
            ];

            const requestData = {
                messages: messages,
                stream: false
            };

            const response = await this.makeRequest('/chat/completions', requestData);
            
            if (response.choices && response.choices.length > 0) {
                const aiResponse = response.choices[0].message.content;
                console.log('✅ AI response received');
                return aiResponse;
            } else {
                throw new Error('Invalid response format from AI API');
            }
            
        } catch (error) {
            console.error('❌ AI chat failed:', error);
            throw error;
        }
    }

    /**
     * Make API request
     */
    async makeRequest(endpoint, data) {
        if (!this.apiKey) {
            throw new Error('API key not available');
        }

        const url = this.baseUrl + endpoint;
        const timeout = this.config.timeout || 30000;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                // Provide specific error messages
                switch (response.status) {
                    case 401:
                        errorMessage = 'API密钥无效或已过期，请检查密钥设置';
                        break;
                    case 429:
                        errorMessage = 'API调用频率超限，请稍后重试';
                        break;
                    case 500:
                        errorMessage = 'AI服务器内部错误，请稍后重试';
                        break;
                    case 503:
                        errorMessage = 'AI服务暂时不可用，请稍后重试';
                        break;
                }
                
                throw new Error(errorMessage);
            }

            return await response.json();
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接后重试');
            }
            throw error;
        }
    }

    /**
     * Get conversation suggestions
     */
    getConversationStarters() {
        return [
            "我想了解不同教育体系的特点和优势",
            "请帮我制定高中三年的升学规划",
            "如何选择适合我的大学专业？",
            "申请国外大学需要准备哪些材料？",
            "如何提高我的学术背景和竞争力？",
            "课外活动对大学申请有多重要？",
            "如何准备标准化考试（SAT/ACT/托福等）？",
            "请分析我的申请优势和改进空间"
        ];
    }

    /**
     * Get education system specific advice
     */
    async getEducationSystemAdvice(system) {
        const systemPrompts = {
            gaokao: "请介绍中国高考体系的特点、科目设置、录取规则以及升学策略",
            ib: "请详细介绍IB国际文凭课程的特点、评估方式以及申请大学的优势",
            alevel: "请介绍A-Level课程体系的特点、科目选择建议以及英国大学申请流程",
            ap: "请介绍AP课程的特点、选课策略以及对美国大学申请的帮助",
            sat: "请介绍SAT考试的结构、备考策略以及在美国大学申请中的作用"
        };

        const prompt = systemPrompts[system] || "请介绍这个教育体系的特点和升学策略";
        
        try {
            return await this.sendMessage(prompt);
        } catch (error) {
            console.error('Failed to get education system advice:', error);
            return "抱歉，暂时无法获取该教育体系的详细信息。请稍后重试或联系客服。";
        }
    }

    /**
     * Analyze user profile for personalized advice
     */
    async analyzeUserProfile(profile) {
        try {
            const prompt = `请基于以下学生信息提供个性化的升学建议：
            
学生概况：
- 教育体系：${profile.educationSystem || '未指定'}
- 年级：${profile.grade || '未指定'}
- 目标地区：${profile.targetRegion || '未指定'}
- 兴趣专业：${profile.interests || '未指定'}
- 学术背景：${profile.academics || '未指定'}
- 课外活动：${profile.activities || '未指定'}

请提供：
1. 当前优势分析
2. 需要改进的方面
3. 具体行动建议
4. 时间规划建议`;

            return await this.sendMessage(prompt);
        } catch (error) {
            console.error('Failed to analyze user profile:', error);
            return "抱歉，暂时无法完成个人档案分析。请稍后重试。";
        }
    }
}

// Global utility functions
window.setAIApiKey = function(apiKey) {
    if (window.aiService) {
        window.aiService.setApiKey(apiKey);
    } else {
        localStorage.setItem('ai_api_key', apiKey);
    }
    console.log('✅ AI API key saved');
};

window.testAIConnection = async function() {
    if (!window.aiService) {
        console.error('AI Service not initialized');
        return false;
    }
    
    const result = await window.aiService.testConnection();
    if (result.success) {
        window.showNotificationMessage?.('AI API连接成功！', 'success');
    } else {
        window.showNotificationMessage?.(`AI API连接失败：${result.error}`, 'error');
    }
    
    return result.success;
};

// Initialize global instance
if (typeof window !== 'undefined') {
    window.AIService = AIService;
}

console.log('🤖 AI service script loaded');
