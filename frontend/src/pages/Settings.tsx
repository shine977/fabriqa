/**
 * Settings Page
 * 
 * 系统设置页面，提供系统配置和个人设置
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  SimpleGrid,
  FormControl,
  FormLabel,
  Switch,
  Input,
  Select,
  useToast,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Avatar,
  IconButton,
} from '@chakra-ui/react';
import { FiSave, FiUpload } from 'react-icons/fi';
import Page from '../components/Page';
import Form from '../components/Form_bak';
import { FormField } from '../types';

// 个人设置表单字段
const profileFormFields: FormField[] = [
  { 
    id: 'name', 
    label: '姓名', 
    type: 'text', 
    placeholder: '请输入姓名',
    required: true,
    defaultValue: '张三'
  },
  { 
    id: 'email', 
    label: '邮箱', 
    type: 'email', 
    placeholder: '请输入邮箱',
    required: true,
    defaultValue: 'zhangsan@example.com'
  },
  { 
    id: 'phone', 
    label: '电话', 
    type: 'tel', 
    placeholder: '请输入电话',
    defaultValue: '13800000000'
  },
  { 
    id: 'bio', 
    label: '个人简介', 
    type: 'textarea', 
    placeholder: '请输入个人简介',
    rows: 3,
    defaultValue: '系统管理员，负责系统日常维护和管理。'
  },
];

// 密码修改表单字段
const passwordFormFields: FormField[] = [
  { 
    id: 'oldPassword', 
    label: '旧密码', 
    type: 'password', 
    placeholder: '请输入旧密码',
    required: true
  },
  { 
    id: 'newPassword', 
    label: '新密码', 
    type: 'password', 
    placeholder: '请输入新密码',
    required: true
  },
  { 
    id: 'confirmPassword', 
    label: '确认新密码', 
    type: 'password', 
    placeholder: '请再次输入新密码',
    required: true
  },
];

const Settings: React.FC = () => {
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Fabriqa Admin',
    siteDescription: '现代化React后台管理系统',
    pageSize: '10',
    theme: 'light',
    language: 'zh',
    enableNotifications: true,
    enableAnalytics: true,
    maintenance: false,
  });
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // 处理系统设置变更
  const handleSystemSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setSystemSettings({
      ...systemSettings,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    });
  };

  // 保存系统设置
  const handleSaveSystemSettings = () => {
    // 在实际应用中，这里会发送API请求保存设置
    toast({
      title: "设置已保存",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // 处理个人资料表单提交
  const handleProfileSubmit = (values: any) => {
    // 在实际应用中，这里会发送API请求更新个人资料
    toast({
      title: "个人资料已更新",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // 处理密码修改表单提交
  const handlePasswordSubmit = (values: any) => {
    // 在实际应用中，这里会进行密码验证和更新
    if (values.newPassword !== values.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不一致",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    toast({
      title: "密码已更新",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Page title="系统设置">
      <Tabs isLazy colorScheme="brand">
        <TabList>
          <Tab>系统设置</Tab>
          <Tab>个人设置</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box
              bg={bgColor}
              p={5}
              borderRadius="md"
              shadow="sm"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="medium">基本设置</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>网站名称</FormLabel>
                    <Input 
                      name="siteName"
                      value={systemSettings.siteName}
                      onChange={handleSystemSettingChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>网站描述</FormLabel>
                    <Input 
                      name="siteDescription"
                      value={systemSettings.siteDescription}
                      onChange={handleSystemSettingChange}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>默认分页大小</FormLabel>
                    <Select 
                      name="pageSize"
                      value={systemSettings.pageSize}
                      onChange={handleSystemSettingChange}
                    >
                      <option value="10">10条/页</option>
                      <option value="20">20条/页</option>
                      <option value="50">50条/页</option>
                      <option value="100">100条/页</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>主题模式</FormLabel>
                    <Select 
                      name="theme"
                      value={systemSettings.theme}
                      onChange={handleSystemSettingChange}
                    >
                      <option value="light">浅色主题</option>
                      <option value="dark">深色主题</option>
                      <option value="system">跟随系统</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>界面语言</FormLabel>
                    <Select 
                      name="language"
                      value={systemSettings.language}
                      onChange={handleSystemSettingChange}
                    >
                      <option value="zh">中文</option>
                      <option value="en">English</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <Divider my={3} />
                
                <Text fontSize="lg" fontWeight="medium">系统功能</Text>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">启用通知</FormLabel>
                    <Switch 
                      name="enableNotifications"
                      isChecked={systemSettings.enableNotifications}
                      onChange={(e) => 
                        setSystemSettings({
                          ...systemSettings,
                          enableNotifications: e.target.checked
                        })
                      }
                      colorScheme="brand"
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">启用数据分析</FormLabel>
                    <Switch 
                      name="enableAnalytics"
                      isChecked={systemSettings.enableAnalytics}
                      onChange={(e) => 
                        setSystemSettings({
                          ...systemSettings,
                          enableAnalytics: e.target.checked
                        })
                      }
                      colorScheme="brand"
                    />
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">维护模式</FormLabel>
                    <Switch 
                      name="maintenance"
                      isChecked={systemSettings.maintenance}
                      onChange={(e) => 
                        setSystemSettings({
                          ...systemSettings,
                          maintenance: e.target.checked
                        })
                      }
                      colorScheme="red"
                    />
                  </FormControl>
                </SimpleGrid>
                
                <Box pt={4}>
                  <Button 
                    leftIcon={<FiSave />} 
                    colorScheme="brand" 
                    onClick={handleSaveSystemSettings}
                  >
                    保存设置
                  </Button>
                </Box>
              </VStack>
            </Box>
          </TabPanel>
          
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Box
                bg={bgColor}
                p={5}
                borderRadius="md"
                shadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg" fontWeight="medium" mb={4}>个人资料</Text>
                
                <VStack spacing={4} align="center" mb={6}>
                  <Avatar size="xl" name="张三" src="https://bit.ly/broken-link" />
                  <IconButton
                    aria-label="上传头像"
                    icon={<FiUpload />}
                    size="sm"
                    colorScheme="brand"
                  />
                </VStack>
                
                <Form 
                  fields={profileFormFields}
                  onSubmit={handleProfileSubmit}
                  submitLabel="保存资料"
                />
              </Box>
              
              <Box
                bg={bgColor}
                p={5}
                borderRadius="md"
                shadow="sm"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Text fontSize="lg" fontWeight="medium" mb={4}>修改密码</Text>
                
                <Form 
                  fields={passwordFormFields}
                  onSubmit={handlePasswordSubmit}
                  submitLabel="更新密码"
                />
              </Box>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Page>
  );
};

export default Settings;
