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
  useDisclosure,
  Flex,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface EditModalProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
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
    setInternalSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setInternalSubmitting(false);
    }
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
          <Flex justify="flex-end" gap={3} width="full">
            <Button 
              variant="outline" 
              colorScheme="gray" 
              onClick={onClose}
              size="md"
            >
              {cancelLabel || t('common.cancel')}
            </Button>
            
            {!isViewOnly && (
              <Button 
                colorScheme="primary" 
                onClick={handleSubmit}
                isLoading={isSubmitting || internalSubmitting}
                loadingText={t('common.saving')}
                size="md"
              >
                {submitLabel || t('common.save')}
              </Button>
            )}
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditModal;