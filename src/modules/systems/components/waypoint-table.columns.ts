import { h } from 'vue'
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import type { DataTableColumnDef } from '@/shared/components/table/data-table'
import { formatLabel } from '@/shared/utils/formatters'

import type { Waypoint } from '../schemas/waypoint.schema'
import { Eye } from '@lucide/vue'

export const waypointColumns: DataTableColumnDef<Waypoint>[] = [
  {
    accessorKey: 'symbol',
    header: 'Waypoint',

    meta: {
      className: 'w-64',
      headerClassName: 'sticky left-0 z-20 border-r border-border bg-background',
      cellClassName:
        'sticky left-0 z-10 border-r border-border bg-card transition-colors group-hover:bg-background',
    },

    cell: ({ row }) => {
      const waypoint = row.original

      const waypointLink = h(
        RouterLink,
        {
          to: {
            name: routeNames.waypointDetail,
            params: {
              systemSymbol: waypoint.systemSymbol,
              waypointSymbol: waypoint.symbol,
            },
          },

          'aria-label': `View waypoint ${waypoint.symbol}`,

          class:
            'group/waypoint inline-flex max-w-full items-center gap-2 rounded-sm font-mono font-medium text-foreground outline-none underline-offset-4 hover:text-signal hover:underline focus-visible:ring-2 focus-visible:ring-ring',
        },
        {
          default: () => [
            h(
              'span',
              {
                class: 'truncate',
                title: waypoint.symbol,
              },
              waypoint.symbol,
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
          waypointLink,

          waypoint.isUnderConstruction
            ? h(
                'p',
                {
                  class: 'mt-1 inline-flex items-center gap-1.5 text-xs text-warning',
                },
                [
                  h('span', {
                    class: 'size-1.5 shrink-0 rounded-full bg-current',
                    'aria-hidden': 'true',
                  }),

                  'Under construction',
                ],
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
    id: 'orbitals',
    header: 'Orbitals',

    meta: {
      align: 'center',
      className: 'w-24',
      cellClassName: 'font-mono tabular-nums',
    },

    cell: ({ row }) => row.original.orbitals.length,
  },

  {
    id: 'faction',
    header: 'Faction',

    meta: {
      className: 'w-36',
      cellClassName: 'font-mono text-xs',
    },

    cell: ({ row }) => {
      const faction = row.original.faction

      if (!faction) {
        return h(
          'span',
          {
            class: 'font-sans text-xs text-muted-foreground',
          },
          'None reported',
        )
      }

      return faction.symbol
    },
  },

  {
    id: 'traits',
    header: 'Traits',

    meta: {
      className: 'w-72',
    },

    cell: ({ row }) => {
      const traits = row.original.traits

      if (!traits.length) {
        return h(
          'span',
          {
            class: 'text-xs text-muted-foreground',
          },
          'No traits reported.',
        )
      }

      return h(
        'ul',
        {
          class: 'flex flex-wrap gap-2',
          'aria-label': `Traits for ${row.original.symbol}`,
        },
        traits.map((trait) =>
          h(
            'li',
            {
              key: trait.symbol,
              title: trait.description,
              class: [
                'border px-2 py-1 text-xs',

                trait.symbol === 'MARKETPLACE'
                  ? 'border-signal/40 bg-warning-subtle text-signal'
                  : 'border-border bg-background text-muted-foreground',
              ],
            },
            trait.name,
          ),
        ),
      )
    },
  },
]
