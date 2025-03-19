/**
 * FormV2 Test Component
 *
 * 测试React Hook Form实现的表单组件
 */

import React, { useState } from 'react';
import { Box, Button, useToast } from '@chakra-ui/react';
import FormV2 from './Form';
import { FormField } from '../types';

const FormV2Test: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin',
    active: true,
    age: 30,
    notes: 'These are test notes',
  });

  // 表单字段配置
  const fields: FormField[] = [
    {
      id: 'name',
      name: 'name',
      label: '名称',
      type: 'text',
      placeholder: '请输入名称',
      required: true,
    },
    {
      id: 'email',
      name: 'email',
      label: '邮箱',
      type: 'email',
      placeholder: '请输入邮箱',
      required: true,
      pattern: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
      patternMessage: '请输入有效的邮箱地址',
    },
    {
      id: 'role',
      name: 'role',
      label: '角色',
      type: 'select',
      required: true,
      options: [
        { value: 'admin', label: '管理员' },
        { value: 'user', label: '普通用户' },
        { value: 'guest', label: '访客' },
      ],
    },
    {
      id: 'active',
      name: 'active',
      label: '是否激活',
      type: 'switch',
    },
    {
      id: 'age',
      name: 'age',
      label: '年龄',
      type: 'number',
      min: 18,
      max: 100,
    },
    {
      id: 'notes',
      name: 'notes',
      label: '备注',
      type: 'textarea',
      rows: 3,
    },
  ];

  // 处理表单提交
  const handleSubmit = (values: Record<string, any>) => {
    setLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      console.log('Form submitted:', values);
      toast({
        title: '提交成功',
        description: JSON.stringify(values, null, 2),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      
      // 更新初始值（测试初始值变化的情况）
      setInitialValues({
        ...values,
        submittedAt: new Date().toISOString(),
      });
    }, 1000);
  };

  return (
    <Box maxW="800px" mx="auto" p={5}>
      <FormV2
        title="表单测试"
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={loading}
        columnCount={2}
      />
      
      <Box mt={4} textAlign="right">
        <Button
          colorScheme="blue"
          isLoading={loading}
          onClick={() => {
            // 触发表单验证和提交
            const event = new Event('form:validate');
            document.dispatchEvent(event);
          }}
        >
          提交
        </Button>
      </Box>
    </Box>
  );
};

export default FormV2Test;