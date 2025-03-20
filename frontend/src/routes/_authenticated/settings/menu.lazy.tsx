import Menus from '@/features/settings/menu'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/_authenticated/settings/menu')({
  component: Menus,
})

