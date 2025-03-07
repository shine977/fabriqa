/**
 * User Form Component
 * 
 * This component provides a form for creating and updating user information.
 * It handles validation, form submission, and displays appropriate feedback.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  useToast,
  Box,
  Switch,
  FormControl,
  FormLabel,
  VStack,
  HStack,
} from '@chakra-ui/react';
import Form from '../../components/Form';
import { FormField } from '../../types';
import { userService } from '../../services/user';
import { useTranslation } from 'react-i18next';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    isAdmin: false,
    adminLevel: 1,
    isActive: true,
    remark: '',
  });

  const isEditMode = !!userId;

  // Fetch user data if in edit mode
  useEffect(() => {
    if (isEditMode && isOpen) {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const userData = await userService.getUserById(userId);
          setInitialValues({
            username: userData.username || '',
            email: userData.email || '',
            password: '', // Password field is empty in edit mode
            phone: userData.phone || '',
            isAdmin: userData.isAdmin || false,
            adminLevel: userData.adminLevel || 1,
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            remark: userData.remark || '',
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: t('common.error'),
            description: t('user.fetchError'),
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }
  }, [isEditMode, userId, isOpen, t, toast]);

  // Define form fields
  const formFields: FormField[] = [
    {
      id: 'username',
      label: t('user.username'),
      type: 'text',
      placeholder: t('user.usernamePlaceholder'),
      required: true,
    },
    {
      id: 'email',
      label: t('user.email'),
      type: 'email',
      required: false,
      placeholder: t('user.emailPlaceholder'),
    },
    {
      id: 'password',
      label: t('user.password'),
      type: 'password',
      required: !isEditMode, // Required for new users, optional for edits
      placeholder: isEditMode ? t('user.passwordPlaceholderEdit') : t('user.passwordPlaceholder'),
    },
    {
      id: 'phone',
      label: t('user.phone'),
      type: 'text',
      required: false,
      placeholder: t('user.phonePlaceholder'),
    },
    {
      id: 'isAdmin',
      label: t('user.isAdmin'),
      type: 'switch',
      required: false,
    },
    {
      id: 'adminLevel',
      label: t('user.adminLevel'),
      type: 'number',
      required: false,
      min: 1,
      max: 5,
      hidden: initialValues.isAdmin === false,
    },
    {
      id: 'isActive',
      label: t('user.isActive'),
      type: 'switch',
      required: false,
    },
    {
      id: 'remark',
      label: t('user.remark'),
      type: 'textarea',
      required: false,
      placeholder: t('user.remarkPlaceholder'),
      rows: 3,
    },
  ];

  // Handle form submission
  const handleSubmit = async (values: Record<string, any>) => {
    setIsLoading(true);
    try {
      // Remove password if it's empty in edit mode
      if (isEditMode && !values.password) {
        delete values.password;
      }

      if (isEditMode) {
        await userService.updateUser(userId, values);
        toast({
          title: t('common.success'),
          description: t('user.updateSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await userService.createUser(values);
        toast({
          title: t('common.success'),
          description: t('user.createSuccess'),
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: t('common.error'),
        description: isEditMode ? t('user.updateError') : t('user.createError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay 
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      />
      <ModalContent>
        <ModalHeader>
          {isEditMode ? t('user.editUser') : t('user.createUser')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Form
              fields={formFields}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              layout="vertical"
              columnCount={1}
            />
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button 
            colorScheme="blue" 
            isLoading={isLoading}
            form="user-form"
            type="submit"
            onClick={() => {
              // 触发表单提交
              const submitEvent = new Event('submit', { bubbles: true });
              document.getElementById('user-form')?.dispatchEvent(submitEvent);
            }}
          >
            {isEditMode ? t('common.update') : t('common.create')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserForm;
