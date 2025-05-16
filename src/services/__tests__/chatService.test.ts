import { chatService } from '../chatService';
import { supabase } from '../supabase';

// Mock supabase client
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null
            }))
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null
        }))
      }))
    }))
  }
}));

describe('ChatService', () => {
  const mockUserId = 'user_123';
  const mockChatId = 'chat_123';
  const mockMessage = {
    id: 'msg_123',
    models: [
      { id: 'high_aes_general_v21_L', name: '豆包通用2.1', count: 4 },
      { id: 'gpt-4o-image', name: 'GPT-4o-Image', count: 2 }
    ],
    content: '请帮我生成一张山水画，要有云雾缭绕的效果',
    results: {
      images: {
        'GPT-4o-Image': [
          {
            url: 'https://example.com/image1.jpg',
            error: null,
            errorMessage: ''
          }
        ],
        '豆包通用2.1': [
          {
            url: 'https://example.com/image2.jpg',
            error: null,
            errorMessage: ''
          }
        ]
      },
      content: '✅ 图片生成完成！'
    },
    createdAt: '2024-03-25T10:30:00Z'
  };

  const mockChat = {
    id: mockChatId,
    title: '测试聊天',
    messages: [mockMessage],
    created_at: '2024-03-25T10:30:00Z',
    user_id: mockUserId
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserChats', () => {
    it('should fetch user chats successfully', async () => {
      // Mock successful response
      const mockData = [mockChat];
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockData,
          error: null
        })
      }));

      const result = await chatService.getUserChats(mockUserId);

      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('chat_msg');
    });

    it('should handle error when fetching user chats', async () => {
      // Mock error response
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      }));

      await expect(chatService.getUserChats(mockUserId)).rejects.toThrow('Database error');
    });
  });

  describe('createChat', () => {
    it('should create a new chat successfully', async () => {
      // Mock successful response
      (supabase.from as jest.Mock).mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockChat,
          error: null
        })
      }));

      const result = await chatService.createChat(mockUserId);

      expect(result).toEqual(mockChat);
      expect(supabase.from).toHaveBeenCalledWith('chat_msg');
    });

    it('should handle error when creating chat', async () => {
      // Mock error response
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockImplementation(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      }));

      await expect(chatService.createChat(mockUserId)).rejects.toThrow('Database error');
    });
  });

  describe('addMessage', () => {
    it('should add message to chat successfully', async () => {
      // Mock successful responses for both fetch and update
      const mockSupabase = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockChat,
          error: null
        }),
        update: jest.fn().mockReturnThis()
      };

      (supabase.from as jest.Mock).mockImplementation(() => mockSupabase);

      const result = await chatService.addMessage(mockChatId, mockMessage);

      expect(result.messages).toHaveLength(2);
      expect(supabase.from).toHaveBeenCalledWith('chat_msg');
    });

    it('should handle error when adding message', async () => {
      // Mock error response
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      }));

      await expect(chatService.addMessage(mockChatId, mockMessage)).rejects.toThrow('Database error');
    });
  });

  describe('deleteChat', () => {
    it('should delete chat successfully', async () => {
      // Mock successful response
      (supabase.from as jest.Mock).mockImplementation(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      }));

      await expect(chatService.deleteChat(mockChatId)).resolves.not.toThrow();
      expect(supabase.from).toHaveBeenCalledWith('chat_msg');
    });

    it('should handle error when deleting chat', async () => {
      // Mock error response
      const mockError = new Error('Database error');
      (supabase.from as jest.Mock).mockImplementation(() => ({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: mockError
        })
      }));

      await expect(chatService.deleteChat(mockChatId)).rejects.toThrow('Database error');
    });
  });
});
