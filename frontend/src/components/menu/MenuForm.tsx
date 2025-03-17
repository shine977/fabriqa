/**
 * Menu Form Component
 * 
 * Form component for creating and editing menu items
 * Uses the generic Form component
 */
import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../Form';
import { FormField } from '../../types';
import { MenuDto, MenuTypeEnum, CreateMenuDto, UpdateMenuDto } from '../../api/menu';

interface MenuFormProps {
  menu?: MenuDto | null;
  parentMenus?: MenuDto[];
  onSubmit: (values: CreateMenuDto | UpdateMenuDto) => Promise<void>;
  isSubmitting?: boolean;
  isViewOnly?: boolean;
}

/**
 * Menu form component using the generic Form component
 */
const MenuForm: React.FC<MenuFormProps> = ({
  menu,
  parentMenus = [],
  onSubmit,
  isSubmitting = false,
  isViewOnly = false,
}) => {
  const { t } = useTranslation();
  const isEditing = !!menu?.id;

  // Initialize form with default values
  const initialValues: CreateMenuDto = useMemo(() => {
    if (menu) {
      return {
        name: menu.name,
        path: menu.path || '',
        type: menu.type,
        component: menu.component || '',
        icon: menu.icon || '',
        orderNum: menu.orderNum,
        permission: menu.permission || '',
        isVisible: menu.isVisible,
        isEnabled: menu.isEnabled,
        parentId: menu.parentId || undefined,
        meta: menu.meta || {
          title: '',
          icon: '',
          noCache: false,
          breadcrumb: true,
          affix: false,
          activeMenu: '',
        },
      };
    }
    
    return {
      name: '',
      path: '',
      type: MenuTypeEnum.MENU,
      component: '',
      icon: '',
      orderNum: 0,
      permission: '',
      isVisible: true,
      isEnabled: true,
      parentId: undefined,
      meta: {
        title: '',
        icon: '',
        noCache: false,
        breadcrumb: true,
        affix: false,
        activeMenu: '',
      },
    };
  }, [menu]);

  // Define form fields
  const fields: FormField[] = useMemo(() => {
    // Create parent menu options for select field
    const parentOptions = [
      { value: '', label: t('menu.noParent') },
      ...parentMenus
        .filter(m => m.id !== menu?.id) // Prevent self-reference
        .map(parent => ({
          value: parent.id,
          label: parent.name,
        })),
    ];

    // Create menu type options
    const typeOptions = [
      { value: MenuTypeEnum.DIRECTORY, label: t('menu.typeDirectory') },
      { value: MenuTypeEnum.MENU, label: t('menu.typeMenu') },
      { value: MenuTypeEnum.BUTTON, label: t('menu.typeButton') },
    ];

    return [
      {
        id: 'name',
        name: 'name',
        label: t('menu.name'),
        type: 'text',
        placeholder: t('menu.namePlaceholder'),
        required: true,
        disabled: isViewOnly,
      },
      {
        id: 'type',
        name: 'type',
        label: t('menu.type'),
        type: 'select',
        options: typeOptions,
        required: true,
        disabled: isViewOnly || isEditing,
      },
      {
        id: 'parentId',
        name: 'parentId',
        label: t('menu.parent'),
        type: 'select',
        options: parentOptions,
        disabled: isViewOnly,
      },
      {
        id: 'path',
        name: 'path',
        label: t('menu.path'),
        type: 'text',
        placeholder: t('menu.pathPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'component',
        name: 'component',
        label: t('menu.component'),
        type: 'text',
        placeholder: t('menu.componentPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'icon',
        name: 'icon',
        label: t('menu.icon'),
        type: 'text',
        placeholder: t('menu.iconPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'orderNum',
        name: 'orderNum',
        label: t('menu.orderNum'),
        type: 'number',
        min: 0,
        max: 9999,
        defaultValue: 0,
        disabled: isViewOnly,
      },
      {
        id: 'permission',
        name: 'permission',
        label: t('menu.permission'),
        type: 'text',
        placeholder: t('menu.permissionPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'isVisible',
        name: 'isVisible',
        label: t('menu.isVisible'),
        type: 'switch',
        defaultValue: true,
        disabled: isViewOnly,
      },
      {
        id: 'isEnabled',
        name: 'isEnabled',
        label: t('menu.isEnabled'),
        type: 'switch',
        defaultValue: true,
        disabled: isViewOnly,
      },
      // Meta fields
      {
        id: 'meta.title',
        name: 'meta.title',
        label: t('menu.metaTitle'),
        type: 'text',
        placeholder: t('menu.metaTitlePlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'meta.icon',
        name: 'meta.icon',
        label: t('menu.metaIcon'),
        type: 'text',
        placeholder: t('menu.metaIconPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'meta.noCache',
        name: 'meta.noCache',
        label: t('menu.metaNoCache'),
        type: 'switch',
        defaultValue: false,
        disabled: isViewOnly,
      },
      {
        id: 'meta.breadcrumb',
        name: 'meta.breadcrumb',
        label: t('menu.metaBreadcrumb'),
        type: 'switch',
        defaultValue: true,
        disabled: isViewOnly,
      },
      {
        id: 'meta.affix',
        name: 'meta.affix',
        label: t('menu.metaAffix'),
        type: 'switch',
        defaultValue: false,
        disabled: isViewOnly,
      },
      {
        id: 'meta.activeMenu',
        name: 'meta.activeMenu',
        label: t('menu.metaActiveMenu'),
        type: 'text',
        placeholder: t('menu.metaActiveMenuPlaceholder'),
        disabled: isViewOnly,
      },
    ];
  }, [t, parentMenus, menu, isViewOnly, isEditing]);

  // Form submission handler
  const handleFormSubmit = async (values: Record<string, any>) => {
    // Convert values to appropriate types if needed
    const formattedValues = {
      ...values,
      orderNum: Number(values.orderNum),
      // Ensure boolean fields are correctly typed
      isVisible: Boolean(values.isVisible),
      isEnabled: Boolean(values.isEnabled),
      meta: {
        ...values.meta,
        noCache: Boolean(values.meta?.noCache),
        breadcrumb: Boolean(values.meta?.breadcrumb),
        affix: Boolean(values.meta?.affix),
      },
    };
    
    await onSubmit(formattedValues as CreateMenuDto | UpdateMenuDto);
  };

  return (
    <Form
      fields={fields}
      initialValues={initialValues}
      onSubmit={handleFormSubmit}
      submitButtonText={isEditing ? t('common.update') : t('common.create')}
      isLoading={isSubmitting}
      layout="vertical"
      columnCount={2}
    />
  );
};

export default MenuForm;