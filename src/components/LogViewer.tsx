import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { readTextFile } from '@tauri-apps/api/fs';
import { Button, Card, Typography, Space, Spin, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * 日志查看器组件
 * 用于显示应用程序日志
 */
const LogViewer: React.FC = () => {
  const [logContent, setLogContent] = useState<string>('');
  const [logPath, setLogPath] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 加载日志内容
  const loadLogContent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 获取当前日志文件路径
      const path = await invoke<string>('get_log_file_path');
      setLogPath(path);
      
      try {
        // 读取日志文件内容
        const content = await readTextFile(path);
        setLogContent(content);
      } catch (err) {
        console.error('读取日志文件失败:', err);
        setError(`无法读取日志文件: ${err}`);
        setLogContent('');
      }
    } catch (err) {
      console.error('获取日志文件路径失败:', err);
      setError(`无法获取日志文件路径: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载日志
  useEffect(() => {
    loadLogContent();
  }, []);

  return (
    <Card 
      title={
        <Space>
          <Title level={4}>应用程序日志</Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={loadLogContent}
            loading={loading}
          >
            刷新
          </Button>
        </Space>
      }
      style={{ width: '100%', marginBottom: 20 }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin tip="加载日志中..." />
        </div>
      ) : error ? (
        <Alert
          message="加载日志失败"
          description={error}
          type="error"
          showIcon
        />
      ) : (
        <div>
          <Text type="secondary">日志文件路径: {logPath}</Text>
          <pre 
            style={{ 
              marginTop: 10,
              padding: 10, 
              backgroundColor: '#f5f5f5', 
              borderRadius: 4,
              maxHeight: '500px',
              overflow: 'auto',
              fontSize: '12px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {logContent || '日志为空'}
          </pre>
        </div>
      )}
    </Card>
  );
};

export default LogViewer; 