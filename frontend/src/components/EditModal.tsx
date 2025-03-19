/**
 * Edit Modal Component
 * 
 * A reusable modal component for editing data with form validation
 * Supports customizable form fields and submit actions
 */
import React, { ReactNode, useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,

} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface EditModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (...args: any[]) => Promise<void> | void;
  children: ReactNode;
  isSubmitting?: boolean;
  isViewOnly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
  submitLabel?: string;
  cancelLabel?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

/**
 * Reusable modal component for editing data
 * 
 * @param props Component properties
 * @returns JSX Element
 */
const EditModal: React.FC<EditModalProps> = ({
  title,
  isOpen,
  onClose,
  onSubmit,
  children,
  isSubmitting = false,
  isViewOnly = false,
  size = 'lg',
  submitLabel,
  cancelLabel,
  initialFocusRef,
}) => {
  const { t } = useTranslation();
  const [internalSubmitting, setInternalSubmitting] = useState(false);

  // Reset internal submitting state when isSubmitting prop changes
  useEffect(() => {
    if (!isSubmitting && internalSubmitting) {
      setInternalSubmitting(false);
    }
  }, [isSubmitting, internalSubmitting]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!onSubmit) return; // 如果onSubmit未定义，直接返回
    
    // 触发自定义事件，通知表单进行验证
    const validationEvent = new CustomEvent('form:validate');
    document.dispatchEvent(validationEvent);
    
    // 监听验证结果
    const handleValidationResult = async (e: CustomEvent) => {
      const { isValid, data } = e.detail;
      
      // 移除事件监听器
      document.removeEventListener('form:validationResult', handleValidationResult as unknown as EventListener);
      
      if (isValid) {
        setInternalSubmitting(true);
        try {
          // 等待提交完成
          await Promise.resolve(onSubmit(data));
          // 如果没有抛出错误，关闭模态框
          onClose();
        } catch (error) {
          console.error('Form submission error:', error);
          // 提交失败，不关闭模态框
        } finally {
          setInternalSubmitting(false);
        }
      }
    };
    
    // 添加事件监听器
    document.addEventListener('form:validationResult', handleValidationResult as unknown as EventListener);
  };

  return (
    <Modal
      isOpen={isOpen}

      onClose={onClose}
      size={size}
      initialFocusRef={initialFocusRef}
      scrollBehavior="inside"
      isCentered
    >
      <ModalOverlay 
        bg="blackAlpha.300" 
        backdropFilter="blur(4px)"
      />
      <ModalContent 
        shadow="lg" 
        rounded="md"
        bg="white" 
        _dark={{ bg: 'neutral.800' }}
      >
        <ModalHeader 
          borderBottomWidth="1px" 
          py={4}
          fontWeight="bold"
          color="gray.800"
          _dark={{ color: 'white' }}
        >
          {title}
        </ModalHeader>
        <ModalCloseButton size="md" color="gray.500" />
        
        <ModalBody py={6} px={6}>
          {children}
        </ModalBody>

        <ModalFooter borderTopWidth="1px" py={4}>
        
          <Button 
            variant="outline" 
            colorScheme="gray" 
            onClick={onClose}
            isDisabled={isSubmitting || internalSubmitting}
            size="md"
          >
            {cancelLabel || t('common.cancel')}
          </Button>
          {!isViewOnly && onSubmit && (
            <Button 
              colorScheme="blue" 
              ml={3} 
              onClick={handleSubmit}
              isLoading={isSubmitting || internalSubmitting}
              loadingText={t('action.saving')}
            >
              {submitLabel || t('action.save')}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditModal;