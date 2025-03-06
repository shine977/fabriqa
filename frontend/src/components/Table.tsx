/**
 * Table Component
 * 
 * 通用表格组件，支持排序、筛选和分页
 */

import React, { useState, useEffect } from 'react';
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
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { pluginSystem } from '../plugins';
import { TableColumn } from '../types';

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
}) => {
  // 使用插件系统处理列定义
  const columns = pluginSystem.applyHooks('table:columns', propColumns);
  
  // 使用插件系统处理数据
  const data = pluginSystem.applyHooks('table:data', propData);
  
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
    const newSelectedRowKeys = isSelected
      ? selectedRowKeys.filter(k => k !== key)
      : [...selectedRowKeys, key];
    
    setSelectedRowKeys(newSelectedRowKeys);
    rowSelection.onChange(
      newSelectedRowKeys,
      data.filter(item => newSelectedRowKeys.includes(String(item[rowKey])))
    );
  };
  
  // 表格样式
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box className={className} overflowX="auto">
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
      
      <ChakraTable variant="simple" size="md">
        <Thead bg={headerBg}>
          <Tr>
            {rowSelection && (
              <Th px={4} py={3} width="1%">
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
            
            {columns.map((column, index) => (
              <Th
                key={`${column.key}-${index}`}
                px={4}
                py={3}
                textAlign={column.align || 'left'}
                position={column.fixed ? 'sticky' : undefined}
                left={column.fixed === 'left' ? 0 : undefined}
                right={column.fixed === 'right' ? 0 : undefined}
                zIndex={column.fixed ? 10 : undefined}
                bg={column.fixed ? headerBg : undefined}
                width={column.width}
              >
                {column.title}
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
                py={6}
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
                _hover={{ bg: onRowClick ? hoverBg : undefined }}
              >
                {rowSelection && (
                  <Td px={4} py={3} width="1%">
                    <Checkbox
                      isChecked={selectedRowKeys.includes(String(record[rowKey]))}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleRowSelect(record);
                      }}
                    />
                  </Td>
                )}
                
                {columns.map((column, columnIndex) => (
                  <Td
                    key={`${column.key}-${columnIndex}`}
                    px={4}
                    py={3}
                    textAlign={column.align || 'left'}
                    position={column.fixed ? 'sticky' : undefined}
                    left={column.fixed === 'left' ? 0 : undefined}
                    right={column.fixed === 'right' ? 0 : undefined}
                    zIndex={column.fixed ? 1 : undefined}
                    bg={column.fixed ? useColorModeValue('white', 'gray.800') : undefined}
                    whiteSpace="nowrap"
                    isTruncated={column.ellipsis}
                  >
                    {column.render
                      ? column.render(record[column.dataIndex], record, recordIndex)
                      : record[column.dataIndex]}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </Tbody>
      </ChakraTable>
      
      {pagination && pagination.total > 0 && (
        <Flex
          justify="space-between"
          align="center"
          px={4}
          py={3}
          borderTopWidth="1px"
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
