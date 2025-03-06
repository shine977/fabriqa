/**
 * Form Component
 * 
 * 通用表单组件，支持多种字段类型和验证
 */

import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  Stack,
  HStack,
  VStack,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { pluginSystem } from '../plugins';
import { FormField } from '../types';

interface FormProps {
  title?: string;
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  submitButtonText?: string;
  isLoading?: boolean;
  layout?: 'vertical' | 'horizontal';
  columnCount?: 1 | 2 | 3;
  className?: string;
}

const Form: React.FC<FormProps> = ({
  title,
  fields: propFields,
  initialValues = {},
  onSubmit,
  submitButtonText = '提交',
  isLoading = false,
  layout = 'vertical',
  columnCount = 1,
  className = '',
}) => {
  // 使用插件系统处理字段
  const fields = pluginSystem.applyHooks('form:fields', propFields);
  
  // 表单状态
  const [values, setValues] = React.useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  
  // 表单变更处理
  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // 标记为已触碰
    if (!touched[name]) {
      setTouched(prev => ({ ...prev, [name]: true }));
    }
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // 验证表单
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.required && !values[field.name]) {
        newErrors[field.name] = `${field.label}是必填项`;
      }
      
      // 可以在这里添加更多验证规则
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // 表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 标记所有字段为已触碰
    const allTouched: Record<string, boolean> = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setTouched(allTouched);
    
    // 验证表单
    if (validate()) {
      // 使用插件系统处理表单数据
      const processedData = pluginSystem.applyHooks('form:beforeSubmit', values);
      onSubmit(processedData);
    }
  };
  
  // 渲染表单字段
  const renderField = (field: FormField) => {
    // 如果字段隐藏，则不渲染
    if (field.hidden) return null;
    
    // 自定义渲染
    if (field.customRender) {
      return field.customRender(field);
    }
    
    const hasError = !!errors[field.name] && touched[field.name];
    
    // 基础属性
    const commonProps = {
      id: field.name,
      value: values[field.name] !== undefined ? values[field.name] : field.defaultValue || '',
      placeholder: field.placeholder,
      isDisabled: field.disabled,
      isInvalid: hasError,
      ...field.fieldProps,
    };
    
    switch (field.type) {
      case 'input':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <Input
              {...commonProps}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
        
      case 'textarea':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <Textarea
              {...commonProps}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
        
      case 'select':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <Select
              {...commonProps}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              {!field.required && <option value="">请选择</option>}
              {field.options?.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
        
      case 'radio':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <RadioGroup
              {...commonProps}
              onChange={(value) => handleChange(field.name, value)}
            >
              <Stack direction="row">
                {field.options?.map((option, index) => (
                  <Radio key={index} value={String(option.value)}>
                    {option.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <Checkbox
              {...commonProps}
              isChecked={!!values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            >
              {field.label}
            </Checkbox>
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
        
      case 'switch':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <Switch
              {...commonProps}
              isChecked={!!values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
            />
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
        
      case 'number':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.name}>{field.label}</FormLabel>
            <NumberInput
              {...commonProps}
              onChange={(_, valueAsNumber) => handleChange(field.name, valueAsNumber)}
            >
              <NumberInputField />
            </NumberInput>
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );
        
      default:
        return null;
    }
  };
  
  const formBg = useColorModeValue('white', 'gray.800');
  const formBorderColor = useColorModeValue('gray.200', 'gray.700');
  
  // 计算列宽
  const colSpan = 12 / columnCount;
  
  return (
    <Box
      className={`form-container ${className}`}
      bg={formBg}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={formBorderColor}
      overflow="hidden"
      boxShadow="sm"
    >
      {title && (
        <>
          <Box p={4} borderBottomWidth="1px" borderColor={formBorderColor}>
            <Heading size="md">{title}</Heading>
          </Box>
        </>
      )}
      
      <Box p={6}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={6} direction="column">
            {columnCount === 1 ? (
              // 单列布局
              <VStack spacing={4} align="stretch">
                {fields.map((field, index) => (
                  <Box key={field.name || index}>
                    {renderField(field)}
                  </Box>
                ))}
              </VStack>
            ) : (
              // 多列布局
              <Stack
                spacing={6}
                direction={{ base: 'column', md: 'row' }}
                wrap="wrap"
              >
                {fields.map((field, index) => (
                  <Box
                    key={field.name || index}
                    flex={`0 0 calc(${100 / columnCount}% - 1rem)`}
                    minW={{ base: '100%', md: `calc(${100 / columnCount}% - 1rem)` }}
                  >
                    {renderField(field)}
                  </Box>
                ))}
              </Stack>
            )}
            
            <Divider />
            
            <Box textAlign="right">
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
              >
                {submitButtonText}
              </Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default Form;
