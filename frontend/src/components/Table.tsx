/**
 * Table Component
 * 
 * 通用表格组件，支持排序、筛选和分页，与插件系统深度集成
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table as ChakraTable,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Spinner,
  Flex,
  Text,
  ButtonGroup,
  Button,
  IconButton,
  useColorModeValue,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  HStack,
  Select,
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  SearchIcon,
  SettingsIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@chakra-ui/icons';
import { pluginSystem } from '../plugins';
import { TableColumn } from '../types';

// 表格配置接口
interface TableSettings {
  density: 'compact' | 'comfortable' | 'spacious';
  stripedRows: boolean;
  showBorders: boolean;
  highlightOnHover: boolean;
}

// 排序配置
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// 过滤配置
interface FilterConfig {
  [key: string]: any;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  rowKey?: string;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  className?: string;
  onRowClick?: (record: any) => void;
  rowSelection?: {
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: any[]) => void;
  };
  showSearch?: boolean;
  showSettings?: boolean;
  defaultSettings?: Partial<TableSettings>;
}

const Table: React.FC<TableProps> = ({
  columns: propColumns,
  data: propData,
  rowKey = 'id',
  loading = false,
  pagination,
  className = '',
  onRowClick,
  rowSelection,
  showSearch = true,
  showSettings = true,
  defaultSettings,
}) => {
  // 表格设置状态
  const [settings, setSettings] = useState<TableSettings>({
    density: defaultSettings?.density || 'comfortable',
    stripedRows: defaultSettings?.stripedRows !== undefined ? defaultSettings.stripedRows : true,
    showBorders: defaultSettings?.showBorders !== undefined ? defaultSettings.showBorders : false,
    highlightOnHover: defaultSettings?.highlightOnHover !== undefined ? defaultSettings.highlightOnHover : true,
  });
  
  // 应用插件系统处理设置
  const finalSettings = useMemo(() => {
    return pluginSystem.applyHooks('dataTable:settings', settings);
  }, [settings]);
  
  // 使用插件系统处理列定义
  const columns = useMemo(() => {
    return pluginSystem.applyHooks('table:columns', propColumns);
  }, [propColumns]);
  
  // 排序状态
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  
  // 过滤状态
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({});
  
  // 搜索状态
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // 处理排序后的数据
  const sortedData = useMemo(() => {
    let sortableData = [...propData];
    
    // 如果有排序配置
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      
      // 使用插件系统处理排序
      sortableData = pluginSystem.applyHooks('dataTable:sorter', 
        (data: any[], config: SortConfig) => {
          return data.sort((a, b) => {
            const aValue = a[config.key];
            const bValue = b[config.key];
            
            if (aValue < bValue) {
              return config.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
              return config.direction === 'asc' ? 1 : -1;
            }
            return 0;
          });
        }, 
        sortableData, 
        sortConfig
      );
    }
    
    return sortableData;
  }, [propData, sortConfig]);
  
  // 处理过滤后的数据
  const filteredData = useMemo(() => {
    let filteredData = sortedData;
    
    // 应用筛选条件
    if (Object.keys(filterConfig).length > 0) {
      // 使用插件系统处理过滤
      filteredData = pluginSystem.applyHooks('dataTable:filterProcessor',
        (data: any[], config: FilterConfig) => {
          return data.filter(item => {
            for (const key in config) {
              if (config[key] && item[key] !== config[key]) {
                return false;
              }
            }
            return true;
          });
        },
        filteredData,
        filterConfig
      );
    }
    
    // 应用搜索
    if (searchTerm) {
      filteredData = filteredData.filter(item => {
        return columns.some(column => {
          const value = item[column.dataIndex];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }
    
    return filteredData;
  }, [sortedData, filterConfig, searchTerm, columns]);
  
  // 使用插件系统处理数据
  const data = useMemo(() => {
    return pluginSystem.applyHooks('table:data', filteredData);
  }, [filteredData]);
  
  // 处理排序请求
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnKey) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };
  
  // 处理行选择
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(
    rowSelection?.selectedRowKeys || []
  );
  
  useEffect(() => {
    if (rowSelection) {
      setSelectedRowKeys(rowSelection.selectedRowKeys);
    }
  }, [rowSelection?.selectedRowKeys]);
  
  const handleRowSelect = (record: any) => {
    if (!rowSelection) return;
    
    const key = String(record[rowKey]);
    const isSelected = selectedRowKeys.includes(key);
    
    // 使用插件系统处理行选择
    const newSelection = pluginSystem.applyHooks('dataTable:rowSelection',
      (current: boolean, rec: any, idx: number) => !current,
      isSelected,
      record,
      propData.indexOf(record)
    );
    
    const newSelectedRowKeys = newSelection
      ? [...selectedRowKeys, key]
      : selectedRowKeys.filter(k => k !== key);
    
    setSelectedRowKeys(newSelectedRowKeys);
    rowSelection.onChange(
      newSelectedRowKeys,
      data.filter(item => newSelectedRowKeys.includes(String(item[rowKey])))
    );
  };
  
  // 计算样式
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const stripedBg = useColorModeValue('gray.50', 'gray.700');
  
  // 行高样式
  const densityStyles = {
    compact: { px: 2, py: 1 },
    comfortable: { px: 4, py: 3 },
    spacious: { px: 6, py: 4 },
  };
  
  return (
    <Box className={className}>
      {/* 工具栏 */}
      {(showSearch || showSettings) && (
        <Flex 
          justify="space-between" 
          align="center" 
          mb={4} 
          p={2} 
          borderWidth={finalSettings.showBorders ? "1px" : 0}
          borderRadius="md" 
          borderColor={borderColor}
        >
          {/* 搜索框 */}
          {showSearch && (
            <Flex maxW="300px">
              <Input
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
              />
              <IconButton
                ml={2}
                aria-label="搜索"
                icon={<SearchIcon />}
                size="sm"
              />
            </Flex>
          )}
          
          {/* 设置菜单 */}
          {showSettings && (
            <Menu>
              <Tooltip label="表格设置">
                <MenuButton 
                  as={IconButton} 
                  icon={<SettingsIcon />} 
                  variant="outline" 
                  size="sm"
                  aria-label="表格设置"
                />
              </Tooltip>
              <MenuList>
                <MenuItem closeOnSelect={false}>
                  <Flex w="100%" justify="space-between" align="center">
                    <Text>密度</Text>
                    <Select 
                      size="xs" 
                      value={finalSettings.density}
                      onChange={(e) => setSettings({...settings, density: e.target.value as any})}
                      width="120px"
                    >
                      <option value="compact">紧凑</option>
                      <option value="comfortable">适中</option>
                      <option value="spacious">宽松</option>
                    </Select>
                  </Flex>
                </MenuItem>
                <MenuItem closeOnSelect={false} onClick={() => 
                  setSettings({...settings, stripedRows: !settings.stripedRows})
                }>
                  <Checkbox isChecked={finalSettings.stripedRows}>
                    条纹行
                  </Checkbox>
                </MenuItem>
                <MenuItem closeOnSelect={false} onClick={() => 
                  setSettings({...settings, showBorders: !settings.showBorders})
                }>
                  <Checkbox isChecked={finalSettings.showBorders}>
                    显示边框
                  </Checkbox>
                </MenuItem>
                <MenuItem closeOnSelect={false} onClick={() => 
                  setSettings({...settings, highlightOnHover: !settings.highlightOnHover})
                }>
                  <Checkbox isChecked={finalSettings.highlightOnHover}>
                    悬停高亮
                  </Checkbox>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      )}
      
      {/* 加载中状态 */}
      {loading && (
        <Flex justify="center" align="center" h="20" w="full">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="md"
          />
        </Flex>
      )}
      
      {/* 表格 */}
      <Box 
        overflowX="auto" 
        borderWidth={finalSettings.showBorders ? "1px" : 0}
        borderRadius="md"
        borderColor={borderColor}
      >
        <ChakraTable variant={finalSettings.showBorders ? "simple" : "unstyled"} size="md">
          <Thead bg={headerBg}>
            <Tr>
              {/* 选择框 */}
              {rowSelection && (
                <Th {...densityStyles[finalSettings.density]} width="1%">
                  <Checkbox
                    isChecked={selectedRowKeys.length > 0 && selectedRowKeys.length === data.length}
                    isIndeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < data.length}
                    onChange={() => {
                      if (!rowSelection) return;
                      
                      const newSelectedRowKeys =
                        selectedRowKeys.length === data.length
                          ? []
                          : data.map(item => String(item[rowKey]));
                      
                      setSelectedRowKeys(newSelectedRowKeys);
                      rowSelection.onChange(
                        newSelectedRowKeys,
                        data.filter(item => newSelectedRowKeys.includes(String(item[rowKey])))
                      );
                    }}
                  />
                </Th>
              )}
              
              {/* 列头 */}
              {columns.map((column, index) => (
                <Th
                  key={`${column.dataIndex || column.key}-${index}`}
                  {...densityStyles[finalSettings.density]}
                  textAlign={column.align || 'left'}
                  position={column.fixed ? 'sticky' : undefined}
                  left={column.fixed === 'left' ? 0 : undefined}
                  right={column.fixed === 'right' ? 0 : undefined}
                  zIndex={column.fixed ? 10 : undefined}
                  bg={column.fixed ? headerBg : undefined}
                  width={column.width}
                  cursor={column.sorter ? 'pointer' : undefined}
                  onClick={() => column.sorter && handleSort(column.dataIndex || column.key)}
                >
                  <Flex align="center">
                    {column.title}
                    {column.sorter && sortConfig && sortConfig.key === (column.dataIndex || column.key) && (
                      <Box ml={1}>
                        {sortConfig.direction === 'asc' ? <ArrowUpIcon boxSize={3} /> : <ArrowDownIcon boxSize={3} />}
                      </Box>
                    )}
                  </Flex>
                </Th>
              ))}
            </Tr>
          </Thead>
          
          <Tbody>
            {data.length === 0 ? (
              <Tr>
                <Td
                  colSpan={columns.length + (rowSelection ? 1 : 0)}
                  textAlign="center"
                  {...densityStyles[finalSettings.density]}
                >
                  <Text color="gray.500">无数据</Text>
                </Td>
              </Tr>
            ) : (
              data.map((record, recordIndex) => (
                <Tr
                  key={record[rowKey] || recordIndex}
                  onClick={() => onRowClick && onRowClick(record)}
                  cursor={onRowClick ? 'pointer' : 'default'}
                  _hover={{ bg: finalSettings.highlightOnHover ? hoverBg : undefined }}
                  bg={finalSettings.stripedRows && recordIndex % 2 === 1 ? stripedBg : undefined}
                >
                  {/* 选择框 */}
                  {rowSelection && (
                    <Td {...densityStyles[finalSettings.density]} width="1%">
                      <Checkbox
                        isChecked={selectedRowKeys.includes(String(record[rowKey]))}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(record);
                        }}
                      />
                    </Td>
                  )}
                  
                  {/* 数据单元格 */}
                  {columns.map((column, columnIndex) => {
                    // 获取列值
                    const value = record[column.dataIndex];
                    
                    // 自定义渲染或默认渲染
                    let cellContent = column.render
                      ? column.render(value, record, recordIndex)
                      : value;
                    
                    // 应用插件系统处理单元格渲染
                    if (column.dataIndex === 'status' || column.key === 'status') {
                      cellContent = pluginSystem.applyHooks('dataTable:statusCellRenderer', 
                        cellContent, 
                        value, 
                        record, 
                        recordIndex
                      );
                    }
                    
                    return (
                      <Td
                        key={`${column.dataIndex || column.key}-${columnIndex}`}
                        {...densityStyles[finalSettings.density]}
                        textAlign={column.align || 'left'}
                        position={column.fixed ? 'sticky' : undefined}
                        left={column.fixed === 'left' ? 0 : undefined}
                        right={column.fixed === 'right' ? 0 : undefined}
                        zIndex={column.fixed ? 1 : undefined}
                        bg={column.fixed ? useColorModeValue('white', 'gray.800') : undefined}
                        whiteSpace="nowrap"
                        isTruncated={column.ellipsis}
                      >
                        {cellContent}
                      </Td>
                    );
                  })}
                </Tr>
              ))
            )}
          </Tbody>
        </ChakraTable>
      </Box>
      
      {/* 分页 */}
      {pagination && pagination.total > 0 && (
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={3}
          mt={4}
          borderWidth={finalSettings.showBorders ? "1px" : 0}
          borderRadius="md"
          borderColor={borderColor}
        >
          <Text fontSize="sm" color="gray.600">
            显示 {(pagination.currentPage - 1) * pagination.pageSize + 1} 到{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} 条，
            共 {pagination.total} 条
          </Text>
          
          <ButtonGroup size="sm" variant="outline" spacing={2}>
            <IconButton
              aria-label="上一页"
              icon={<ChevronLeftIcon boxSize={4} />}
              onClick={() => pagination.onChange(pagination.currentPage - 1, pagination.pageSize)}
              isDisabled={pagination.currentPage === 1}
            />
            
            <Button variant="solid" colorScheme="blue">
              {pagination.currentPage} / {Math.ceil(pagination.total / pagination.pageSize)}
            </Button>
            
            <IconButton
              aria-label="下一页"
              icon={<ChevronRightIcon boxSize={4} />}
              onClick={() => pagination.onChange(pagination.currentPage + 1, pagination.pageSize)}
              isDisabled={
                pagination.currentPage === Math.ceil(pagination.total / pagination.pageSize)
              }
            />
          </ButtonGroup>
        </Flex>
      )}
    </Box>
  );
};

export default Table;
