/**
 * Page Component
 * 
 * 通用页面组件，提供标准化的页面结构
 */

import React, { useEffect } from 'react';
import {
  Box,
  Heading,
  Divider,
  Spinner,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { pluginSystem } from '../plugins';

interface PageProps {
  title?: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

const Page: React.FC<PageProps> = ({
  title,
  children,
  headerContent,
  footerContent,
  loading = false,
  className = '',
}) => {
  useEffect(() => {
    // 使用插件系统处理标题
    if (title) {
      const modifiedTitle = pluginSystem.applyHooks('page:title', title);
      document.title = modifiedTitle;
    }
  }, [title]);

  // 应用page:content钩子
  const content = pluginSystem.applyHooks('page:content', children);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      className={`page-container ${className}`}
      bg={bgColor}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="sm"
    >
      {/* 页面头部 */}
      {(title || headerContent) && (
        <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
          {title && <Heading size="lg">{title}</Heading>}
          {headerContent && <Box mt={2}>{headerContent}</Box>}
        </Box>
      )}

      {/* 页面内容 */}
      <Box p={6}>
        {loading ? (
          <Flex justify="center" align="center" h="40">
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </Flex>
        ) : (
          content
        )}
      </Box>

      {/* 页面底部 */}
      {footerContent && (
        <>
          <Divider />
          <Box p={4}>{footerContent}</Box>
        </>
      )}
    </Box>
  );
};

export default Page;
