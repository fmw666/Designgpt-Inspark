import { useState, useEffect } from 'react';
import { SparklesIcon, PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

// 示例提示词
const DEMO_PROMPTS = [
  '一只可爱的熊猫在竹林中玩耍，水彩风格',
  '一片樱花林，水彩风格，柔和的粉色和白色',
  '一幅山水画，国画风格，云雾缭绕',
  '未来城市，赛博朋克风格，霓虹灯光',
];

interface CachedContent {
  prompt: string;
  text: string;
  images: string[];
  timestamp: number;
}

const CACHE_KEY = 'gpt4o_test_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时

const Gpt4oTest = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    text?: string;
    images?: string[];
  } | null>(null);

  // 从缓存加载数据
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const data: CachedContent = JSON.parse(cached);
        // 检查缓存是否过期
        if (Date.now() - data.timestamp < CACHE_EXPIRY) {
          setPrompt(data.prompt);
          setResult({
            success: true,
            message: '从缓存加载成功',
            text: data.text,
            images: data.images,
          });
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (e) {
        console.error('Error loading cache:', e);
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }, []);

  // 保存到缓存
  const saveToCache = (prompt: string, text: string, images: string[]) => {
    const cacheData: CachedContent = {
      prompt,
      text,
      images,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  const handleTest = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResult(null);

    let currentText = '';
    let currentImages: string[] = [];

    try {
      let response: any = "todo"
      // const response = await gpt4oService.generateImage({
      //   prompt,
      //   model: 'gpt-4o-image',
      //   stream: true,
      //   onContent: (content) => {
      //     if (content.type === 'text') {
      //       currentText += content.content;
      //       setResult(prev => ({
      //         ...prev!,
      //         text: currentText,
      //       }));
      //     } else {
      //       currentImages.push(content.content);
      //       setResult(prev => ({
      //         ...prev!,
      //         images: [...currentImages],
      //       }));
      //     }
      //   }
      // });

      if (response.success) {
        setResult({
          success: true,
          message: response.message || '生成成功！',
          text: currentText,
          images: currentImages,
        });
        // 保存到缓存
        saveToCache(prompt, currentText, currentImages);
      } else {
        setResult({
          success: false,
          message: response.error || '生成失败',
        });
      }
    } catch (error) {
      console.error('GPT-4 测试失败:', error);
      setResult({
        success: false,
        message: `生成失败：${error instanceof Error ? error.message : '未知错误'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = (demoPrompt: string) => {
    setPrompt(demoPrompt);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">提示词</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
              输入提示词
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入测试提示词..."
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              示例提示词
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PROMPTS.map((demoPrompt, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoClick(demoPrompt)}
                  className="p-2 text-sm text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                  {demoPrompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleTest}
          disabled={!prompt.trim() || isLoading}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5 mr-2" />
              开始生成
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`bg-white rounded-lg shadow-sm p-6 ${
          result.success ? 'border border-green-200' : 'border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            {result.success ? (
              <SparklesIcon className="h-5 w-5 text-green-500" />
            ) : (
              <PhotoIcon className="h-5 w-5 text-red-500" />
            )}
            <h2 className="text-lg font-medium text-gray-900">生成结果</h2>
          </div>
          
          <p className={`text-sm font-medium ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.message}
          </p>

          {result.text && (
            <div className="mt-4 prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    />
                  ),
                }}
              >
                {result.text}
              </ReactMarkdown>
            </div>
          )}

          {result.images && result.images.length > 0 && (
            <div className="mt-4 space-y-4">
              {result.images.map((imageUrl, index) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`生成的图片 ${index + 1}`}
                  className="w-full h-auto rounded-lg shadow-md"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gpt4oTest;