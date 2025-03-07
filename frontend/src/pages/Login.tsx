/**
 * Login Page Component
 * 
 * 登录页面组件，提供用户认证入口
 * 采用现代科技风格设计，注重用户体验与视觉美感
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Checkbox,
  useColorModeValue,
  useToast,
  IconButton,
  Divider,
  useDisclosure,
  ScaleFade,
  Radio,
  RadioGroup,
  HStack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, LockIcon, EmailIcon, AtSignIcon, UserIcon } from '@chakra-ui/icons';
import { FiGithub, FiTwitter, FiLinkedin, FiUser } from 'react-icons/fi';
import { useTranslation } from '../plugins/i18nPlugin';
import { ThemeMode } from '../plugins/themePlugin';
import { pluginSystem } from '../plugins';
import { useAuth } from '../services/auth';

// 背景图案 SVG
const patternBg = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`;

// 定义用户类型
type UserType = 'supplier' | 'employee';

// 定义登录凭证类型
type LoginCredentialType = 'email' | 'username';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { login, loginStatus } = useAuth();
  const [identifier, setIdentifier] = useState(''); // 用户名或邮箱
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{identifier?: string, password?: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState<UserType>('employee'); // 默认为内部员工
  const [credentialType, setCredentialType] = useState<LoginCredentialType>('email'); // 默认使用邮箱登录
  
  // 获取当前主题
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    pluginSystem.applyHooks('theme:getCurrentTheme', 'system')
  );
  
  // 动画控制
  const { isOpen, onOpen } = useDisclosure();
  
  // 在组件挂载时启动入场动画
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  // 从 URL 参数中获取重定向信息
  const from = location.state?.from?.pathname || '/';

  // 是否是邮箱格式
  const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  
  // 是否是有效的用户名
  const isValidUsername = (value: string) => /^[a-zA-Z0-9_]{3,20}$/.test(value);

  // 表单验证
  const validateForm = () => {
    const newErrors: {identifier?: string, password?: string} = {};
    
    if (!identifier) {
      newErrors.identifier = t('validation.required');
    } else if (credentialType === 'email' && !isEmail(identifier)) {
      newErrors.identifier = t('validation.invalidEmail');
    } else if (credentialType === 'username' && !isValidUsername(identifier)) {
      newErrors.identifier = t('validation.invalidUsername');
    }
    
    if (!password) {
      newErrors.password = t('validation.required');
    } else if (password.length < 6) {
      newErrors.password = t('validation.passwordTooShort');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 登录处理
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // 确定登录凭证
    const credentials = {
      password
    };
    
    // 根据登录类型设置用户名或邮箱
    if (credentialType === 'email') {
      credentials['email'] = identifier;
    } else {
      credentials['username'] = identifier;
    }
    
    // 调用登录API，登录成功后会自动跳转
    login(credentials, from);
  };

  // 切换凭证类型（邮箱/用户名）
  const toggleCredentialType = () => {
    setCredentialType(prev => prev === 'email' ? 'username' : 'email');
    setIdentifier(''); // 清空输入
    setErrors({}); // 清空错误
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800"
    >
      <ScaleFade initialScale={0.9} in={isOpen}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          overflow="hidden"
          maxW="1200px"
          w={{ base: "95%", md: "90%" }}
          mx="auto"
          boxShadow="xl"
          borderRadius="xl"
          className="dark:bg-neutral-800 bg-white border border-gray-100 dark:border-neutral-700"
        >
          {/* 左侧设计区域 */}
          <Box
            w={{ base: "100%", md: "50%" }}
            h={{ base: "200px", md: "auto" }}
            bg="primary.600"
            color="white"
            p={{ base: 8, md: 10 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            position="relative"
            className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800"
          >
            <Box 
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              opacity="0.1"
              backgroundImage={patternBg}
            />
            <Box zIndex="1" textAlign="center">
              <Box 
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                bg="white"
                w="16"
                h="16"
                rounded="full"
                mb="6"
                className="shadow-glow"
              >
                <Box 
                  as="span" 
                  color="primary.600"
                  fontSize="3xl"
                  fontWeight="bold"
                >
                  F
                </Box>
              </Box>
              <Heading size="xl" mb="4" fontWeight="bold">
                {t('appName')}
              </Heading>
              <Text fontSize="md" opacity="0.8" maxW="md" textAlign="center">
                {t('login.welcomeMessage')}
              </Text>
            </Box>
          </Box>

          {/* 右侧表单区域 */}
          <Box 
            w={{ base: "100%", md: "50%" }}
            p={{ base: 8, md: 10 }}
            bg={useColorModeValue('white', 'gray.800')}
          >
            <Heading
              as="h2"
              size="lg"
              fontWeight="bold"
              mb="1"
              textAlign="center"
            >
              {t('login.signIn')}
            </Heading>
            <Text 
              fontSize="sm" 
              textAlign="center"
              color={useColorModeValue('gray.600', 'gray.400')}
              mb="8"
            >
              {t('login.enterCredentials')}
            </Text>

            {/* 用户类型选择 */}
            <FormControl mb={6}>
              <FormLabel>{t('login.userType')}</FormLabel>
              <RadioGroup value={userType} onChange={(value) => setUserType(value as UserType)}>
                <HStack spacing={5}>
                  <Radio value="employee" colorScheme="primary">
                    {t('login.userTypes.employee')}
                  </Radio>
                  <Radio value="supplier" colorScheme="primary">
                    {t('login.userTypes.supplier')}
                  </Radio>
                </HStack>
              </RadioGroup>
            </FormControl>

            <form onSubmit={handleLogin}>
              {/* 用户标识（邮箱或用户名）*/}
              <FormControl
                id="identifier"
                mb="4"
                isInvalid={!!errors.identifier}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <FormLabel>{credentialType === 'email' ? t('login.email') : t('login.username')}</FormLabel>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={toggleCredentialType}
                    mb={2}
                    color="primary.500"
                  >
                    {credentialType === 'email' ? t('login.username') : t('login.email')}
                  </Button>
                </Flex>
                <InputGroup>
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={credentialType === 'email' ? 'example@company.com' : 'username'}
                    size="lg"
                    borderRadius="md"
                  />
                  <InputRightElement height="full" color="gray.400">
                    {credentialType === 'email' ? <EmailIcon /> : <Box as={FiUser} />}
                  </InputRightElement>
                </InputGroup>
                {errors.identifier && (
                  <FormErrorMessage>{errors.identifier}</FormErrorMessage>
                )}
              </FormControl>

              {/* 密码 */}
              <FormControl
                id="password"
                mb="6"
                isInvalid={!!errors.password}
              >
                <FormLabel>{t('login.password')}</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    size="lg"
                    borderRadius="md"
                  />
                  <InputRightElement h="full">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
              </FormControl>

              {/* 记住我和忘记密码 */}
              <Flex justify="space-between" mb="6" align="center">
                <Checkbox
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  colorScheme="primary"
                >
                  <Text fontSize="sm">{t('login.rememberMe')}</Text>
                </Checkbox>
                <Button variant="link" size="sm" colorScheme="primary">
                  {t('login.forgotPassword')}
                </Button>
              </Flex>

              {/* 登录按钮 */}
              <Button
                type="submit"
                colorScheme="primary"
                size="lg"
                fontSize="md"
                w="full"
                isLoading={loginStatus.isLoading}
                loadingText={t('login.signingIn')}
                mb="6"
                boxShadow="md"
                _hover={{
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                }}
              >
                {t('login.signInButton')}
              </Button>

              {/* 分隔线 */}
              <Flex align="center" my="6">
                <Divider flex="1" />
                <Text mx="4" color="gray.500" fontSize="sm">
                  {t('login.or')}
                </Text>
                <Divider flex="1" />
              </Flex>

              {/* 社交登录 */}
              <Stack direction="row" spacing="4" mb="6">
                <Button
                  w="full"
                  size="lg"
                  variant="outline"
                  leftIcon={<FiGithub />}
                  _hover={{ bg: 'blackAlpha.100' }}
                >
                  GitHub
                </Button>
                <Button
                  w="full"
                  size="lg"
                  variant="outline"
                  leftIcon={<FiTwitter />}
                  _hover={{ bg: 'blue.50' }}
                >
                  Twitter
                </Button>
                <Button
                  w="full"
                  size="lg"
                  variant="outline"
                  leftIcon={<FiLinkedin />}
                  _hover={{ bg: 'blue.50' }}
                >
                  LinkedIn
                </Button>
              </Stack>

              {/* 注册链接 */}
              <Text textAlign="center" fontSize="sm">
                {t('login.noAccount')}{' '}
                <Button
                  variant="link"
                  colorScheme="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  {t('login.createAccount')}
                </Button>
              </Text>
            </form>
          </Box>
        </Flex>
      </ScaleFade>
    </Flex>
  );
};

export default Login;
