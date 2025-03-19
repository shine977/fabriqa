/**
 * FormV2 Component
 *
 * 通用表单组件，使用React Hook Form实现，支持多种字段类型和验证
 */

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
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
  VStack,
  Heading,
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

const FormV2: React.FC<FormProps> = ({
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
  // 使用React Hook Form替代手动状态管理
  const {
    control,
    handleSubmit: rhfHandleSubmit,
    formState: { errors },
    reset,
    getValues,
    trigger
  } = useForm({
    defaultValues: initialValues,
  });

  // 当initialValues变化时重置表单
  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);



  // 渲染表单字段
  const renderField = (field: FormField) => {
    // 如果字段隐藏，则不渲染
    if (field.hidden) return null;

    // 自定义渲染
    if (field.render) {
      return (
        <Controller
          control={control}
          name={field.name}
          render={({ field: { onChange, value } }) => 
            field.render!(field, value, onChange)
          }
        />
      );
    }

    const hasError = !!errors[field.name];

    // 使用Controller包装字段
    return (
      <Controller
        control={control}
        name={field.name}
        rules={{ 
          required: field.required ? `${field.label}是必填项` : false,
          // 可以添加其他验证规则
        }}
        render={({ field: { onChange, value, ref, onBlur } }) => {
          // 基础属性
          const commonProps = {
            id: field.id,
            name: field.name,
            ref,
            onBlur,
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
                  <Input 
                    {...commonProps} 
                    value={value || ''}
                    onChange={e => onChange(e.target.value)} 
                    type={field.type}
                  />
                  {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
                  {hasError && <FormErrorMessage>{errors[field.name]?.message as string}</FormErrorMessage>}
                </FormControl>
              );

            case 'textarea':
              return (
                <FormControl 
                  isInvalid={hasError} 
                  isRequired={field.required}
                  display={layout === 'horizontal' ? 'flex' : 'block'}
                  alignItems={layout === 'horizontal' ? 'center' : 'stretch'}
                >
                  <FormLabel 
                    htmlFor={field.id}
                    width={layout === 'horizontal' ? '120px' : 'auto'}
                    mb={layout === 'horizontal' ? 0 : 2}
                  >
                    {field.label}
                  </FormLabel>
                  <Box flex={layout === 'horizontal' ? 1 : 'auto'}>
                    <Textarea 
                      {...commonProps} 
                      value={value || ''}
                      onChange={e => onChange(e.target.value)} 
                      rows={field.rows} 
                    />
                    {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
                    {hasError && <FormErrorMessage>{errors[field.name]?.message as string}</FormErrorMessage>}
                  </Box>
                </FormControl>
              );

            case 'select':
              return (
                <FormControl 
                  isInvalid={hasError} 
                  isRequired={field.required}
                  display={layout === 'horizontal' ? 'flex' : 'block'}
                  alignItems={layout === 'horizontal' ? 'center' : 'stretch'}
                >
                  <FormLabel 
                    htmlFor={field.id}
                    width={layout === 'horizontal' ? '120px' : 'auto'}
                    mb={layout === 'horizontal' ? 0 : 2}
                  >
                    {field.label}
                  </FormLabel>
                  <Box flex={layout === 'horizontal' ? 1 : 'auto'}>
                    <Select 
                      {...commonProps} 
                      value={value || ''}
                      onChange={e => onChange(e.target.value)}
                    >
                      {!field.required && <option value="">请选择</option>}
                      {field.options?.map((option, index) => (
                        <option key={index} value={option.value} disabled={option.disabled}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
                    {hasError && <FormErrorMessage>{errors[field.name]?.message as string}</FormErrorMessage>}
                  </Box>
                </FormControl>
              );

            case 'radio':
              return (
                <FormControl isInvalid={hasError} isRequired={field.required}>
                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                  <RadioGroup 
                    value={String(value || '')}
                    onChange={onChange}
                  >
                    <Stack direction="row">
                      {field.options?.map((option, index) => (
                        <Radio 
                          key={index} 
                          value={String(option.value)} 
                          isDisabled={option.disabled || field.disabled}
                        >
                          {option.label}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                  {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
                  {hasError && <FormErrorMessage>{errors[field.name]?.message as string}</FormErrorMessage>}
                </FormControl>
              );

            case 'checkbox':
              return (
                <FormControl isInvalid={hasError} isRequired={field.required}>
                  <Checkbox
                    {...commonProps}
                    isChecked={!!value}
                    onChange={e => onChange(e.target.checked)}
                  >
                    {field.label}
                  </Checkbox>
                  {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
                  {hasError && <FormErrorMessage>{errors[field.name]?.message as string}</FormErrorMessage>}
                </FormControl>
              );

            case 'switch':
              return (
                <FormControl isInvalid={hasError} isRequired={field.required}>
                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                  <Switch
                    {...commonProps}
                    isChecked={!!value}
                    onChange={e => onChange(e.target.checked)}
                  />
                  {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
                  {hasError && <FormErrorMessage>{errors[field.name]?.message as string}</FormErrorMessage>}
                </FormControl>
              );

            case 'number':
              return (
                <FormControl isInvalid={hasError} isRequired={field.required}>
                  <FormLabel htmlFor={field.id}>{field.label}</FormLabel>
                  <NumberInput 
                    {...commonProps}
                    value={value || ''}
                    min={field.min}
                    max={field.max}
                    onChange={(valueAsString, valueAsNumber) => onChange(valueAsNumber)}
                  >
                    <NumberInputField placeholder={field.placeholder} />
                  </NumberInput>
                  {field.helper && <FormHelperText>{field.helper}</FormHelperText>}
                  {hasError && <FormErrorMessage>{errors[field.name]?.message as string}</FormErrorMessage>}
                </FormControl>
              );

            default:
              return null;
          }
        }}
      />
    );
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
        <form onSubmit={rhfHandleSubmit(onSubmit)}>
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

export default FormV2;