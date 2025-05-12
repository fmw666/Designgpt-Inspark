import { FC, useState } from 'react';
import { BeakerIcon, SparklesIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import DoubaoTest from './DoubaoTest';
import Gpt4oTest from './Gpt4oTest';

const TestLayout: FC = () => {
  const [selectedTest, setSelectedTest] = useState('doubao');

  const tests = [
    {
      id: 'doubao',
      name: '豆包服务测试',
      icon: SparklesIcon,
      component: DoubaoTest,
      description: '测试豆包AI绘图服务的各项功能',
    },
    {
      id: 'gpt4',
      name: 'GPT-4o 测试',
      icon: CommandLineIcon,
      component: Gpt4oTest,
      description: '测试GPT-4o语言模型的能力',
    },
    // 可以添加更多测试项
  ];

  const selectedTestConfig = tests.find(test => test.id === selectedTest);
  const TestComponent = selectedTestConfig?.component;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 侧边栏 */}
      <div className="w-72 bg-white/80 backdrop-blur-sm border-r border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <BeakerIcon className="h-6 w-6 text-indigo-500" />
            <h1 className="text-xl font-semibold text-gray-900">AI 服务测试</h1>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            测试和验证各种AI服务的功能
          </p>
        </div>
        <nav className="mt-2 px-3">
          {tests.map((test) => {
            const Icon = test.icon;
            return (
              <button
                key={test.id}
                onClick={() => setSelectedTest(test.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-sm transition-all ${
                  selectedTest === test.id
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 mt-0.5 ${
                  selectedTest === test.id ? 'text-indigo-500' : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {test.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200">
            {TestComponent && <TestComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLayout; 