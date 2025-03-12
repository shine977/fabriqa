/**
 * Login Page Component
 *
 * 登录页面组件，提供用户认证入口
 * 采用现代科技风格设计，注重用户体验与视觉美感
 * 融合光效、动画与优雅过渡，打造沉浸式登录体验
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
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
  HStack,
  Container,
  Center,
  Spinner,
  Icon,
  VStack,
  Image,
  Select,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { ViewIcon, ViewOffIco, EmailIcon } from '@chakra-ui/icons';
import { FiUser, FiLogIn } from 'react-icons/fi';
import { useTranslation } from '../plugins/i18nPlugin';
import { ThemeMode } from '../plugins/themePlugin';
import { appPlugin } from '../plugins';
import { useAuth } from '../services/auth';
import { encryptData } from '../utils/crypto';

// 背景图案 SVG
// 光效动画
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 10px 2px rgba(79, 209, 197, 0.3); }
  50% { box-shadow: 0 0 20px 5px rgba(79, 209, 197, 0.5); }
  100% { box-shadow: 0 0 10px 2px rgba(79, 209, 197, 0.3); }
`;

// 浮动动画
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// 定义用户类型
type UserType = 'supplier' | 'employee';

// 定义登录凭证类型
type LoginCredentialType = 'email' | 'username';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginStatus } = useAuth();
  const [identifier, setIdentifier] = useState(''); // 用户名或邮箱
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [userType, setUserType] = useState<UserType>('employee'); // 默认为内部员工
  const [credentialType, setCredentialType] = useState<LoginCredentialType>('email'); // 默认使用邮箱登录

  // 获取当前主题
  const [themeMode, setThemeMode] = useState<ThemeMode>(appPlugin.applyHooks('theme:getCurrentTheme', 'system'));

  // 动画控制
  const { isOpen, onOpen } = useDisclosure();

  // Toast通知
  const toast = useToast();

  // 在组件挂载时启动入场动画
  useEffect(() => {
    onOpen();
  }, [onOpen]);

  // 从 URL 参数中获取重定向信息
  const from = location.state?.from?.pathname || '/';

  const isEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const isValidUsername = (value: string) => /^[a-zA-Z0-9_]{3,20}$/.test(value);

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};

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
      password: await encryptData(password, 'e3a74e3c7599f3ab4601d587bd2cc768'),
    };

    // 根据登录类型设置用户名或邮箱
    if (credentialType === 'email') {
      credentials['email'] = identifier;
    } else {
      credentials['username'] = identifier;
    }

    // 设置用户类型
    credentials.type = userType;

    // 调用登录API，登录成功后会自动跳转
    login(credentials, from);
  };

  // 切换凭证类型（邮箱/用户名）
  const toggleCredentialType = () => {
    setCredentialType(prev => (prev === 'email' ? 'username' : 'email'));
    setIdentifier(''); // 清空输入
    setErrors({}); // 清空错误
  };

  // 计算当前主题的样式
  const currentThemeStyles = {
    bgColor: themeMode === 'dark' ? 'gray.800' : 'white',
    textColor: themeMode === 'dark' ? 'gray.100' : 'gray.700',
    inputBgColor: themeMode === 'dark' ? 'gray.900' : 'gray.50',
  };

  // 品牌颜色
  const brandColor = useColorModeValue('primary.600', 'primary.500');
  const bgGradient = useColorModeValue('linear(to-br, primary.600, cyan.600)', 'linear(to-br, primary.700, cyan.800)');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  // 动画样式
  const glowStyle = {
    animation: `${glowAnimation} 3s infinite ease-in-out`,
  };

  const floatStyle = {
    animation: `${floatAnimation} 6s infinite ease-in-out`,
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      position="relative"
      className={`bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-800 ${
        themeMode === 'dark' ? 'dark' : ''
      }`}
      overflow="hidden"
    >
      {/* 背景装饰元素 */}
      <Box
        position="absolute"
        top="5%"
        right="5%"
        w="500px"
        h="300px"
        borderRadius="full"
        bgGradient={bgGradient}
        opacity="0.1"
        filter="blur(40px)"
        zIndex="0"
        sx={floatStyle}
      />

      <Box
        position="absolute"
        bottom="10%"
        left="5%"
        w="200px"
        h="200px"
        borderRadius="full"
        bgGradient={bgGradient}
        opacity="0.1"
        filter="blur(30px)"
        zIndex="0"
        sx={floatStyle}
      />

      <ScaleFade initialScale={0.9} in={isOpen}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          overflow="hidden"
          maxW="1200px"
          w={{ base: '95%', md: '90%' }}
          mx="auto"
          boxShadow="2xl"
          borderRadius="2xl"
          className="dark:bg-neutral-800 bg-white border border-gray-100 dark:border-neutral-700"
          position="relative"
          zIndex="1"
        >
          {/* 左侧设计区域 */}
          <Box
            w={{ base: '100%', md: '50%' }}
            h={{ base: '250px', md: 'auto' }}
            bg="primary.600"
            color="white"
            p={{ base: 8, md: 10 }}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            position="relative"
            overflow="hidden"
            className="bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800"
          >
            {/* 背景图案 */}
            <Box position="absolute" top="0" left="0" right="0" bottom="0" opacity="0.1" className="gradient-mesh" />

            {/* 装饰光圈 */}
            <Box
              position="absolute"
              bottom="-150px"
              right="-150px"
              width="300px"
              height="300px"
              borderRadius="full"
              bg="whiteAlpha.100"
              sx={glowStyle}
            />

            <Box
              position="absolute"
              top="-100px"
              left="-100px"
              width="200px"
              height="200px"
              borderRadius="full"
              bg="whiteAlpha.100"
              sx={glowStyle}
            />

            {/* 主内容 */}
            <Box zIndex="1" textAlign="center" sx={floatStyle}>
              <Box
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                bg="white"
                w="20"
                h="20"
                rounded="full"
                mb="6"
                sx={glowStyle}
                className="shadow-glow"
              >
                <Box as="span" color="primary.600" fontSize="4xl" fontWeight="bold">
                  F
                </Box>
              </Box>
              <Heading size="xl" mb="4" fontWeight="bold" letterSpacing="tight">
                {t('appName')}
              </Heading>
              <Text fontSize="md" opacity="0.9" maxW="md" textAlign="center">
                {t('login.welcomeMessage')}
              </Text>
            </Box>
          </Box>

          {/* 右侧表单区域 */}
          <Box w={{ base: '100%', md: '50%' }} p={{ base: 8, md: 10 }} bg={cardBg} color={currentThemeStyles.textColor}>
            <Heading
              as="h2"
              size="lg"
              fontWeight="bold"
              mb="1"
              textAlign="center"
              color={textColor}
              letterSpacing="tight"
            >
              {t('login.signIn')}
            </Heading>
            <Text fontSize="sm" textAlign="center" color={useColorModeValue('gray.600', 'gray.400')} mb="8">
              {t('login.enterCredentials')}
            </Text>

            {/* 用户类型选择 */}
            <FormControl mb={6}>
              <FormLabel fontWeight="medium" fontSize="sm">
                {t('login.userType')}
              </FormLabel>
              <Select
                value={userType}
                onChange={e => setUserType(e.target.value as UserType)}
                size="lg"
                borderRadius="lg"
                bg={currentThemeStyles.inputBgColor}
                borderColor={borderColor}
                _hover={{ borderColor: brandColor }}
                _focus={{
                  borderColor: brandColor,
                  boxShadow: `0 0 0 1px ${brandColor}`,
                }}
              >
                <option value="employee">{t('login.userTypes.employee')}</option>
                <option value="supplier">{t('login.userTypes.supplier')}</option>
              </Select>
            </FormControl>

            <form onSubmit={handleLogin}>
              {/* 用户标识（邮箱或用户名）*/}
              <FormControl id="identifier" mb="5" isInvalid={!!errors.identifier}>
                <Flex justifyContent="space-between" alignItems="center">
                  <FormLabel fontWeight="medium" fontSize="sm">
                    {credentialType === 'email' ? t('login.email') : t('login.username')}
                  </FormLabel>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={toggleCredentialType}
                    mb={2}
                    color={brandColor}
                    fontWeight="medium"
                    _hover={{ textDecoration: 'none', color: 'primary.600' }}
                  >
                    {credentialType === 'email' ? t('login.username') : t('login.email')}
                  </Button>
                </Flex>
                <InputGroup size="lg">
                  <Input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder={credentialType === 'email' ? 'example@company.com' : 'username'}
                    borderRadius="lg"
                    bg={currentThemeStyles.inputBgColor}
                    borderColor={borderColor}
                    _hover={{ borderColor: 'primary.300' }}
                    _focus={{
                      borderColor: brandColor,
                      boxShadow: `0 0 0 1px ${brandColor}`,
                    }}
                    fontSize="md"
                  />
                  <InputRightElement height="full" color="gray.400" pr={2}>
                    {credentialType === 'email' ? <EmailIcon /> : <Box as={FiUser} />}
                  </InputRightElement>
                </InputGroup>
                {errors.identifier && <FormErrorMessage>{errors.identifier}</FormErrorMessage>}
              </FormControl>

              {/* 密码 */}
              <FormControl id="password" mb="6" isInvalid={!!errors.password}>
                <FormLabel fontWeight="medium" fontSize="sm">
                  {t('login.password')}
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    borderRadius="lg"
                    bg={currentThemeStyles.inputBgColor}
                    borderColor={borderColor}
                    _hover={{ borderColor: 'primary.300' }}
                    _focus={{
                      borderColor: brandColor,
                      boxShadow: `0 0 0 1px ${brandColor}`,
                    }}
                    fontSize="md"
                  />
                  <InputRightElement height="full" pr={2}>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                      color="gray.400"
                      _hover={{ bg: 'transparent', color: brandColor }}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>

              {/* 记住我和忘记密码 */}
              <Flex justify="space-between" mb="6" align="center">
                <Checkbox
                  isChecked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  colorScheme="primary"
                  size="md"
                >
                  <Text fontSize="sm">{t('login.rememberMe')}</Text>
                </Checkbox>
                <Button
                  variant="link"
                  size="sm"
                  colorScheme="primary"
                  fontWeight="medium"
                  _hover={{ textDecoration: 'none' }}
                >
                  {t('login.forgotPassword')}
                </Button>
              </Flex>

              {/* 登录按钮 */}
              <Button
                type="submit"
                bg={brandColor}
                color={themeMode === 'dark' ? 'gray.900' : 'black'}
                size="lg"
                w="full"
                h="56px"
                mb="6"
                boxShadow="md"
                borderRadius="lg"
                _hover={{
                  bg: themeMode === 'dark' ? 'primary.400' : 'primary.700',
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                _active={{
                  transform: 'translateY(0)',
                  boxShadow: 'sm',
                }}
                leftIcon={<FiLogIn size="1.25em" />}
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

              {/* 社交登录按钮位置 */}
              <VStack spacing={4} mb={6}>
                {/* 这里可以添加社交登录按钮 */}
              </VStack>

              {/* 注册链接 */}
              {/* <Text textAlign="center" fontSize="sm">
                {t('login.noAccount')}{' '}
                <Button
                  variant="link"
                  colorScheme="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  {t('login.createAccount')}
                </Button>
              </Text> */}
            </form>
          </Box>
        </Flex>
      </ScaleFade>
    </Flex>
  );
};

export default Login;
