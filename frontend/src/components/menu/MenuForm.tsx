/**
 * Menu Form Component V2
 * 
 * Form component for creating and editing menu items
 * Uses the Form component with React Hook Form
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '../Form';
import { FormField } from '../../types';
import { MenuDto,MenuTypeEnum } from '../../api/menu';
interface MenuFormProps {
  menu?: MenuDto | null;
  parentMenus?: MenuDto[];
  isSubmitting?: boolean;
  isViewOnly?: boolean;
  onSubmit?: (values: any) => void;
}


const MenuForm: React.FC<MenuFormProps> = (({
  menu,
  parentMenus = [],
  isSubmitting = false,
  isViewOnly = false,
  onSubmit,
}) => {
  const { t } = useTranslation(['common', 'menu']);
  const isEditing = !!menu?.id;

  // Create initial values for the form
  const initialValues = useMemo(() => {
    if (menu) {
      return {
        // Basic fields
        name: menu.name || '',
        parentId: menu.parentId || '',
        path: menu.path || '',
        component: menu.component || '',
        redirect: menu.redirect || '',
        icon: menu.icon || '',
        orderNum: menu.orderNum || 0,
        isVisible: menu.isVisible || false,

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
      parentId: '',
      path: '',
      component: '',
      redirect: '',
      icon: '',
      orderNum: 0,
      isVisible: true,
      type: MenuTypeEnum.MENU,
      isEnabled:true,
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
    const parentOptions = parentMenus.map(item => ({
      value: item.id,
      label: item.title,
      disabled: isEditing && item.id === menu?.id, // Disable self-selection when editing
    }));

    // Add empty option
    parentOptions.unshift({
      value: '',
      label: t('menu:noParent'),
      disabled: false,
    });
    // Create menu type options
    const typeOptions = [
      { value: MenuTypeEnum.DIRECTORY, label: t('menu:typeDirectory') },
      { value: MenuTypeEnum.MENU, label: t('menu:typeMenu') },
      { value: MenuTypeEnum.BUTTON, label: t('menu:typeButton') },
    ];
    return [
      {
        id: 'name',
        name: 'name',
        label: t('menu:name'),
        type: 'text',
        placeholder: t('menu:namePlaceholder'),
        required: true,
        
      },
      {
        id: 'type',
        name: 'type',
        label: t('menu:type'),
        type: 'select',
        options: typeOptions,
        required: true,
        disabled: isViewOnly || isEditing,
      },
      {
        id: 'parentId',
        name: 'parentId',
        label: t('menu:parent'),
        type: 'select',
        options: parentOptions,
        
      },
      {
        id: 'path',
        name: 'path',
        label: t('menu:path'),
        type: 'text',
        placeholder: t('menu:pathPlaceholder'),
        required: true,
        
      },
      {
        id: 'component',
        name: 'component',
        label: t('menu:component'),
        type: 'text',
        placeholder: t('menu:componentPlaceholder'),
        required: true,
        
      },
      {
        id: 'icon',
        name: 'icon',
        label: t('menu:icon'),
        type: 'text',
        placeholder: t('menu:iconPlaceholder'),
        required: true,
        
      },
      {
        id: 'orderNum',
        name: 'orderNum',
        label: t('menu:orderNum'),
        type: 'number',
        min: 0,
        max: 9999,
        defaultValue: 0,
        
      },
      {
        id: 'permission',
        name: 'permission',
        label: t('menu:permission'),
        type: 'text',
        placeholder: t('menu:permissionPlaceholder'),
        
      },
      {
        id: 'isVisible',
        name: 'isVisible',
        label: t('menu:isVisible'),
        type: 'switch',
        defaultValue: true,
        
      },
      {
        id: 'isEnabled',
        name: 'isEnabled',
        label: t('menu:isEnabled'),
        type: 'switch',
        defaultValue: true,
        
      },
      // Meta fields
      {
        id: 'meta.title',
        name: 'meta.title',
        label: t('menu:metaTitle'),
        type: 'text',
        placeholder: t('menu:metaTitlePlaceholder'),
        
      },
      {
        id: 'meta.icon',
        name: 'meta.icon',
        label: t('menu:metaIcon'),
        type: 'text',
        placeholder: t('menu:metaIconPlaceholder'),
        
      },
      {
        id: 'meta.noCache',
        name: 'meta.noCache',
        label: t('menu:metaNoCache'),
        type: 'switch',
        defaultValue: false,
        
      },
      {
        id: 'meta.breadcrumb',
        name: 'meta.breadcrumb',
        label: t('menu:metaBreadcrumb'),
        type: 'switch',
        defaultValue: true,
        
      },
      {
        id: 'meta.affix',
        name: 'meta.affix',
        label: t('menu:metaAffix'),
        type: 'switch',
        defaultValue: false,
        
      },
      {
        id: 'meta.activeMenu',
        name: 'meta.activeMenu',
        label: t('menu:metaActiveMenu'),
        type: 'text',
        placeholder: t('menu:metaActiveMenuPlaceholder'),
        
      },
    ];
  }, [t, parentMenus, menu, isViewOnly, isEditing]);

  return (
    <Form
      fields={fields}
      initialValues={initialValues}
      isLoading={isSubmitting}
      layout="vertical"
      columnCount={2}
      onSubmit={onSubmit || (() => {})}
    />
  );
})

export default MenuForm;