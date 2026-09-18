import { h } from 'vue'
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import type { DataTableColumnDef } from '@/shared/components/table/data-table'
import { formatLabel } from '@/shared/utils/formatters'

import type { System } from '../schemas/system.schema'
import { Eye } from '@lucide/vue'

export const systemColumns: DataTableColumnDef<System>[] = [
  {
    accessorKey: 'symbol',
    header: 'System',

    meta: {
      className: 'w-64',
      headerClassName: 'sticky left-0 z-20 border-r border-border bg-background',
      cellClassName:
        'sticky left-0 z-10 border-r border-border bg-card transition-colors group-hover:bg-background',
    },

    cell: ({ row }) => {
      const system = row.original

      const systemLink = h(
        RouterLink,
        {
          to: {
            name: routeNames.systemDetail,
            params: {
              systemSymbol: system.symbol,
            },
          },

          'aria-label': `Open system ${system.symbol}`,

          class:
            'group/system inline-flex max-w-full items-center gap-2 rounded-sm font-medium text-foreground outline-none underline-offset-4 hover:text-signal hover:underline focus-visible:ring-2 focus-visible:ring-ring',
        },
        {
          default: () => [
            h(
              'span',
              {
                class: 'truncate',
              },
              system.name || system.symbol,
            ),

            h(Eye, {
              class:
                'size-4 shrink-0 text-muted-foreground transition-colors group-hover/waypoint:text-signal',
              'aria-hidden': 'true',
            }),
          ],
        },
      )

      return h(
        'div',
        {
          class: 'min-w-0',
        },
        [
          systemLink,

          system.name
            ? h(
                'p',
                {
                  class: 'mt-1 truncate font-mono text-xs text-muted-foreground',
                  title: system.symbol,
                },
                system.symbol,
              )
            : null,
        ],
      )
    },
  },

  {
    accessorKey: 'type',
    header: 'Type',

    meta: {
      className: 'w-36',
      cellClassName: 'capitalize text-orbit',
    },

    cell: ({ row }) => formatLabel(row.original.type),
  },

  {
    id: 'sector',
    header: 'Sector',

    meta: {
      className: 'w-40',
    },

    cell: ({ row }) => {
      const system = row.original

      return h(
        'div',
        {
          class: 'min-w-0',
        },
        [
          h(
            'p',
            {
              class: 'truncate font-mono text-sm text-foreground',
              title: system.sectorSymbol,
            },
            system.sectorSymbol,
          ),

          system.constellation
            ? h(
                'p',
                {
                  class: 'mt-1 truncate text-xs text-muted-foreground',
                  title: system.constellation,
                },
                system.constellation,
              )
            : null,
        ],
      )
    },
  },

  {
    id: 'coordinates',
    header: 'Coordinates',

    meta: {
      align: 'center',
      className: 'w-32',
      cellClassName: 'whitespace-nowrap font-mono tabular-nums',
    },

    cell: ({ row }) => `${row.original.x}, ${row.original.y}`,
  },

  {
    id: 'waypoints',
    header: 'Waypoints',

    meta: {
      align: 'center',
      className: 'w-28',
      cellClassName: 'font-mono tabular-nums',
    },

    cell: ({ row }) => row.original.waypoints.length,
  },

  {
    id: 'factions',
    header: 'Factions',

    meta: {
      className: 'w-32',
    },

    cell: ({ row }) => {
      const factions = row.original.factions.map((faction) => formatLabel(faction.symbol))

      if (!factions.length) {
        return h(
          'span',
          {
            class: 'text-xs text-muted-foreground',
          },
          'None',
        )
      }

      const label = factions.join(', ')

      return h(
        'span',
        {
          class: 'block truncate font-mono text-xs text-foreground',
          title: label,
        },
        label,
      )
    },
  },
]
