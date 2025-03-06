/**
 * Dashboard Page
 * 
 * 系统仪表盘页面，展示系统概览信息
 */

import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Text,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUsers, FiFileText, FiActivity, FiShoppingBag } from 'react-icons/fi';
import Page from '../components/Page';

// 数据卡片组件
interface StatsCardProps {
  title: string;
  stat: string;
  icon: React.ReactNode;
  helpText?: string;
  increase?: boolean;
  decrease?: boolean;
  percentage?: string;
}

function StatsCard(props: StatsCardProps) {
  const { title, stat, icon, helpText, increase, decrease, percentage } = props;
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Stat
      px={{ base: 4, md: 6 }}
      py={5}
      bg={bgColor}
      shadow="base"
      rounded="lg"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Flex justifyContent="space-between">
        <Box>
          <StatLabel fontWeight="medium" isTruncated color={textColor}>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {stat}
          </StatNumber>
          {helpText && (
            <StatHelpText>
              {increase && <StatArrow type="increase" />}
              {decrease && <StatArrow type="decrease" />}
              {percentage}
              {!increase && !decrease ? helpText : ` ${helpText}`}
            </StatHelpText>
          )}
        </Box>
        <Box
          my="auto"
          color={useColorModeValue('brand.500', 'brand.300')}
          alignContent="center"
        >
          {icon}
        </Box>
      </Flex>
    </Stat>
  );
}

const Dashboard: React.FC = () => {
  return (
    <Page title="仪表盘">
      <Text mb={8} fontSize="lg">
        欢迎使用管理系统，以下是系统概况
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatsCard
          title="用户总数"
          stat="5,200"
          icon={<Icon as={FiUsers} w={8} h={8} />}
          helpText="较上月"
          increase={true}
          percentage="10%"
        />
        
        <StatsCard
          title="内容数量"
          stat="1,876"
          icon={<Icon as={FiFileText} w={8} h={8} />}
          helpText="较上月"
          increase={true}
          percentage="5.3%"
        />
        
        <StatsCard
          title="活跃度"
          stat="91%"
          icon={<Icon as={FiActivity} w={8} h={8} />}
          helpText="过去30天"
        />
        
        <StatsCard
          title="销售额"
          stat="¥15,700"
          icon={<Icon as={FiShoppingBag} w={8} h={8} />}
          helpText="较上月"
          decrease={true}
          percentage="3.2%"
        />
      </SimpleGrid>
      
      <Box mt={10}>
        <Text fontSize="lg" fontWeight="medium" mb={4}>
          系统活动
        </Text>
        
        <Box 
          p={5} 
          shadow="base" 
          rounded="lg" 
          bg={useColorModeValue('white', 'gray.700')}
          borderWidth="1px"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Text color="gray.500">
            这里将显示最近的系统活动记录。在实际项目中，我们会展示最近的登录、操作等信息。
          </Text>
        </Box>
      </Box>
    </Page>
  );
};

export default Dashboard;
