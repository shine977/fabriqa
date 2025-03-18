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
  fields,
  initialValues = {},
  onSubmit,
  submitButtonText = '提交',
  isLoading = false,
  layout = 'vertical',
  columnCount = 1,
  className = '',
}) => {


  // 表单状态
  const [values, setValues] = React.useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  // 监听验证事件
  React.useEffect(() => {
    // 处理验证请求
    const handleValidateRequest = () => {
      // 标记所有字段为已触碰
      const allTouched: Record<string, boolean> = {};
      fields.forEach(field => {
        allTouched[field.name] = true;
      });
      setTouched(allTouched);

      // 执行验证
      const isValid = validate();

      // 发送验证结果
      const resultEvent = new CustomEvent('form:validationResult', {
        detail: {
          isValid,
          data: isValid ? values : null
        }
      });
      document.dispatchEvent(resultEvent);
    };

    // 添加事件监听器
    document.addEventListener('form:validate', handleValidateRequest);

    // 清理函数
    return () => {
      document.removeEventListener('form:validate', handleValidateRequest);
    };
  }, [fields, values]);

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
      onSubmit(values);
    }
  };

  // 渲染表单字段
  const renderField = (field: FormField) => {
    // 如果字段隐藏，则不渲染
    if (field.hidden) return null;

    // 自定义渲染
    if (field.render) {
      return field.render(field, values[field.name], (value) => handleChange(field.name, value));
    }

    const hasError = !!errors[field.name] && touched[field.name];

    // 基础属性
    const commonProps = {
      id: field.id,
      name: field.name,
      value: values[field.name] !== undefined ? values[field.name] : field.defaultValue || '',
      placeholder: field.placeholder,
      isDisabled: field.disabled,
      isReadOnly: field.readOnly,
      isInvalid: hasError,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
            <Input {...commonProps} onChange={e => handleChange(field.name, e.target.value)} />
            {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );

      case 'textarea':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
            <Textarea 
              {...commonProps} 
              rows={field.rows} 
              onChange={e => handleChange(field.name, e.target.value)} 
            />
            {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );

      case 'select':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
            <Select {...commonProps} onChange={e => handleChange(field.name, e.target.value)}>
              {!field.required && <option value="">请选择</option>}
              {field.options?.map((option, index) => (
                <option key={index} value={option.value} disabled={option.disabled}>
                  {option.label}
                </option>
              ))}
            </Select>
            {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );

      case 'radio':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
            <RadioGroup 
              name={field.name}
              value={String(values[field.name] || '')} 
              onChange={value => handleChange(field.name, value)}
            >
              <Stack direction="row">
                {field.options?.map((option, index) => (
                  <Radio key={index} value={String(option.value)} isDisabled={option.disabled || field.disabled}>
                    {option.label}
                  </Radio>
                ))}
              </Stack>
            </RadioGroup>
            {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );

      case 'checkbox':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <Checkbox
              id={field.id}
              name={field.name}
              isChecked={!!values[field.name]}
              onChange={e => handleChange(field.name, e.target.checked)}
              isDisabled={field.disabled}
            >
              {field.label}
            </Checkbox>
            {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );

      case 'switch':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
            <Switch
              id={field.id}
              name={field.name}
              isChecked={!!values[field.name]}
              onChange={e => handleChange(field.name, e.target.checked)}
              isDisabled={field.disabled}
            />
            {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );

      case 'number':
        return (
          <FormControl isInvalid={hasError} isRequired={field.required}>
            <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
            <NumberInput 
              id={field.id}
              name={field.name}
              value={values[field.name]}
              min={field.min}
              max={field.max}
              onChange={(valueAsString, valueAsNumber) => handleChange(field.name, valueAsNumber)}
              isDisabled={field.disabled}
            >
              <NumberInputField placeholder={field.placeholder} />
            </NumberInput>
            {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
            {hasError && <FormErrorMessage>{errors[field.name]}</FormErrorMessage>}
          </FormControl>
        );

      default:
        return null;
    }
  };

  const formBg = useColorModeValue('white', 'gray.800');
  const formBorderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      className={`form-container ${className}`}
      bg={formBg}
      overflow="hidden"
    >
      {title && (
        <>
          <Box p={4} borderBottomWidth="1px" borderColor={formBorderColor}>
            <Heading size="md">{title}</Heading>
          </Box>
        </>
      )}

      <Box p={6}>
        <form onSubmit={(e) => {
          e.preventDefault(); // 阻止表单默认提交，避免页面刷新
          if (validate()) {
            onSubmit(values);
          }
        }}>
          <Stack spacing={6} direction="column">
            {columnCount === 1 ? (
              // 单列布局
              <VStack spacing={4} align="stretch">
                {fields.map((field, index) => (
                  <Box key={field.id || index}>{renderField(field)}</Box>
                ))}
              </VStack>
            ) : (
              // 多列布局 - 使用Grid替代Stack以支持换行
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: "1fr",
                  md: `repeat(${columnCount}, 1fr)`
                }}
                gridGap={4}
              >
                {fields.map((field, index) => (
                  <Box key={field.id || index}>
                    {renderField(field)}
                  </Box>
                ))}
              </Box>
            )}

            {/* 提交按钮在需要时可以取消注释 */}
            {/* <Divider />
            <Box textAlign="right">
              <Button type="submit" colorScheme="blue" isLoading={isLoading}>
                {submitButtonText}
              </Button>
            </Box> */}
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default Form;
