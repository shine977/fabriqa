/**
 * Menu Form Component V2
 * 
 * Form component for creating and editing menu items
 * Uses the FormV2 component with React Hook Form
 */

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormV2 from '../Form';
import { FormField } from '../../types';
import { MenuDto } from '../../api/menu';
interface MenuFormProps {
  menu?: MenuDto | null;
  parentMenus?: MenuDto[];
  isSubmitting?: boolean;
  isViewOnly?: boolean;
  onSubmit?: (values: any) => void;
}

// Menu form component using the FormV2 component
const MenuFormV2: React.FC<MenuFormProps> = ({
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
        title: menu.title || '',
        name: menu.name || '',
        parentId: menu.parentId || '',
        path: menu.path || '',
        component: menu.component || '',
        redirect: menu.redirect || '',
        icon: menu.icon || '',
        orderNum: menu.orderNum || 0,
        hidden: menu.hidden || false,

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
      title: '',
      name: '',
      parentId: '',
      path: '',
      component: '',
      redirect: '',
      icon: '',
      orderNum: 0,
      hidden: false,
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

    return [
      // Basic info section
      {
        id: 'title',
        name: 'title',
        label: t('menu:title'),
        type: 'text',
        placeholder: t('menu:titlePlaceholder'),
        required: true,
        disabled: isViewOnly,
      },
      {
        id: 'name',
        name: 'name',
        label: t('menu:name'),
        type: 'text',
        placeholder: t('menu:namePlaceholder'),
        required: true,
        disabled: isViewOnly,
      },
      {
        id: 'parentId',
        name: 'parentId',
        label: t('menu:parent'),
        type: 'select',
        options: parentOptions,
        disabled: isViewOnly,
      },
      {
        id: 'path',
        name: 'path',
        label: t('menu:path'),
        type: 'text',
        placeholder: t('menu:pathPlaceholder'),
        required: true,
        disabled: isViewOnly,
      },
      {
        id: 'component',
        name: 'component',
        label: t('menu:component'),
        type: 'text',
        placeholder: t('menu:componentPlaceholder'),
        required: true,
        disabled: isViewOnly,
      },
      {
        id: 'icon',
        name: 'icon',
        label: t('menu:icon'),
        type: 'text',
        placeholder: t('menu:iconPlaceholder'),
        required: true,
        disabled: isViewOnly,
      },
      {
        id: 'redirect',
        name: 'redirect',
        label: t('menu:redirect'),
        type: 'text',
        placeholder: t('menu:redirectPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'orderNum',
        name: 'orderNum',
        label: t('menu:orderNum'),
        type: 'number',
        min: 0,
        max: 9999,
        disabled: isViewOnly,
      },
      {
        id: 'hidden',
        name: 'hidden',
        label: t('menu:hidden'),
        type: 'switch',
        disabled: isViewOnly,
      },
      
      // Meta section
      {
        id: 'meta.title',
        name: 'meta.title',
        label: t('menu:metaTitle'),
        type: 'text',
        placeholder: t('menu:metaTitlePlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'meta.icon',
        name: 'meta.icon',
        label: t('menu:metaIcon'),
        type: 'text',
        placeholder: t('menu:metaIconPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'meta.noCache',
        name: 'meta.noCache',
        label: t('menu:metaNoCache'),
        type: 'switch',
        disabled: isViewOnly,
      },
      {
        id: 'meta.link',
        name: 'meta.link',
        label: t('menu:metaLink'),
        type: 'text',
        placeholder: t('menu:metaLinkPlaceholder'),
        disabled: isViewOnly,
      },
      {
        id: 'meta.activeMenu',
        name: 'meta.activeMenu',
        label: t('menu:metaActiveMenu'),
        type: 'text',
        placeholder: t('menu:metaActiveMenuPlaceholder'),
        disabled: isViewOnly,
      },
    ];
  }, [t, parentMenus, menu, isViewOnly, isEditing]);

  return (
    <FormV2
      fields={fields}
      initialValues={initialValues}
      isLoading={isSubmitting}
      layout="vertical"
      columnCount={2}
      onSubmit={onSubmit || (() => {})}
    />
  );
};

export default MenuFormV2;