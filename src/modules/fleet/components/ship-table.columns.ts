import { h } from 'vue'
import { RouterLink } from 'vue-router'

import { routeNames } from '@/app/router/route-names'
import type { DataTableColumnDef } from '@/shared/components/table/data-table'
import { formatDate, formatLabel, formatNumber } from '@/shared/utils/formatters'

import type { Ship } from '../schemas/ship.schema'
import { formatShipStatus } from '../utils/ship-status'
import { Eye } from '@lucide/vue'

function getDisplayedLocation(ship: Ship) {
  if (ship.nav.status === 'IN_TRANSIT') {
    return {
      systemSymbol: ship.nav.route.destination.systemSymbol,
      waypointSymbol: ship.nav.route.destination.symbol,
      isDestination: true,
    }
  }

  return {
    systemSymbol: ship.nav.systemSymbol,
    waypointSymbol: ship.nav.waypointSymbol,
    isDestination: false,
  }
}

export const shipColumns: DataTableColumnDef<Ship>[] = [
  {
    accessorKey: 'symbol',
    header: 'Ship',

    meta: {
      className: 'w-60',
      headerClassName: 'sticky left-0 z-20 border-r border-border bg-background',
      cellClassName:
        'sticky left-0 z-10 border-r border-border bg-card transition-colors group-hover:bg-background',
    },

    cell: ({ row }) => {
      const ship = row.original

      const shipLink = h(
        RouterLink,
        {
          to: {
            name: routeNames.shipDetail,
            params: {
              symbol: ship.symbol,
            },
          },

          'aria-label': `Open ship ${ship.symbol}`,

          class:
            'group/ship inline-flex max-w-full items-center gap-2 rounded-sm font-medium text-foreground outline-none underline-offset-4 hover:text-signal hover:underline focus-visible:ring-2 focus-visible:ring-ring',
        },
        {
          default: () => [
            h(
              'span',
              {
                class: 'truncate',
                title: ship.registration.name || ship.symbol,
              },
              ship.registration.name || ship.symbol,
            ),

            h(Eye, {
              class:
                'size-4 shrink-0 text-muted-foreground transition-colors group-hover/system:text-signal',
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
          shipLink,

          ship.registration.name !== ship.symbol
            ? h(
                'p',
                {
                  class: 'mt-1 truncate font-mono text-xs text-muted-foreground',
                  title: ship.symbol,
                },
                ship.symbol,
              )
            : null,

          h(
            'p',
            {
              class: 'mt-1 truncate text-xs text-muted-foreground',
              title: ship.frame.name,
            },
            ship.frame.name,
          ),
        ],
      )
    },
  },

  {
    id: 'role',
    header: 'Role',

    meta: {
      className: 'w-36',
    },

    cell: ({ row }) => {
      const ship = row.original

      return h(
        'div',
        {
          class: 'min-w-0',
        },
        [
          h(
            'p',
            {
              class: 'capitalize text-sm text-foreground',
            },
            formatLabel(ship.registration.role),
          ),

          h(
            'p',
            {
              class: 'mt-1 truncate font-mono text-xs text-muted-foreground',
              title: ship.registration.factionSymbol,
            },
            ship.registration.factionSymbol,
          ),
        ],
      )
    },
  },

  {
    id: 'status',
    header: 'Status',

    meta: {
      className: 'w-36',
    },

    cell: ({ row }) => {
      const ship = row.original
      const status = formatShipStatus(ship.nav.status)

      return h(
        'div',
        {
          class: 'min-w-0',
        },
        [
          h(
            'p',
            {
              class: 'inline-flex items-center gap-2 text-sm',
            },
            [
              h('span', {
                class: ['size-1.5 shrink-0 rounded-full bg-current', status.className],
                'aria-hidden': 'true',
              }),

              h(
                'span',
                {
                  class: status.className,
                },
                status.label,
              ),
            ],
          ),

          h(
            'p',
            {
              class: 'mt-1 text-xs capitalize text-muted-foreground',
            },
            formatLabel(ship.nav.flightMode),
          ),
        ],
      )
    },
  },

  {
    id: 'location',
    header: 'Location',

    meta: {
      className: 'w-56',
    },

    cell: ({ row }) => {
      const ship = row.original

      const location = getDisplayedLocation(ship)

      const systemLink = h(
        RouterLink,
        {
          to: {
            name: routeNames.systemDetail,
            params: {
              systemSymbol: location.systemSymbol,
            },
          },

          'aria-label': `Open system ${location.systemSymbol}`,

          class:
            'rounded-sm font-mono text-xs text-foreground underline-offset-4 hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        },
        {
          default: () => location.systemSymbol,
        },
      )

      const waypointLink = h(
        RouterLink,
        {
          to: {
            name: routeNames.waypointDetail,
            params: {
              systemSymbol: location.systemSymbol,
              waypointSymbol: location.waypointSymbol,
            },
          },

          'aria-label': `Open waypoint ${location.waypointSymbol}`,

          class:
            'mt-1 block truncate rounded-sm font-mono text-xs text-muted-foreground underline-offset-4 hover:text-signal hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        },
        {
          default: () => location.waypointSymbol,
        },
      )

      return h(
        'div',
        {
          class: 'min-w-0',
        },
        [
          location.isDestination
            ? h(
                'p',
                {
                  class: 'mb-1 text-[11px] uppercase tracking-wide text-muted-foreground',
                },
                'Destination',
              )
            : null,

          systemLink,
          waypointLink,

          location.isDestination
            ? h(
                'div',
                {
                  class: 'mt-2',
                },
                [
                  h(
                    'p',
                    {
                      class: 'text-[11px] text-muted-foreground',
                    },
                    'Expected arrival',
                  ),

                  h(
                    'time',
                    {
                      datetime: ship.nav.route.arrival,
                      class: 'mt-0.5 block font-mono text-xs text-muted-foreground',
                    },
                    formatDate(ship.nav.route.arrival),
                  ),
                ],
              )
            : null,
        ],
      )
    },
  },

  {
    id: 'fuel',
    header: 'Fuel',

    meta: {
      align: 'center',
      className: 'w-32',
    },

    cell: ({ row }) => {
      const fuel = row.original.fuel

      if (fuel.capacity === 0) {
        return h(
          'span',
          {
            class: 'text-xs text-muted-foreground',
          },
          'No fuel capacity',
        )
      }

      return h(
        'div',
        {
          class: 'whitespace-nowrap',
        },
        [
          h(
            'p',
            {
              class: 'font-mono text-sm tabular-nums text-foreground',
            },
            `${formatNumber(fuel.current)} / ${formatNumber(fuel.capacity)}`,
          ),

          h(
            'p',
            {
              class: 'mt-1 text-xs text-muted-foreground',
            },
            'units',
          ),
        ],
      )
    },
  },

  {
    id: 'cargo',
    header: 'Cargo',

    meta: {
      align: 'center',
      className: 'w-32',
    },

    cell: ({ row }) => {
      const cargo = row.original.cargo

      if (cargo.capacity === 0) {
        return h(
          'span',
          {
            class: 'text-xs text-muted-foreground',
          },
          'No cargo capacity',
        )
      }

      return h(
        'div',
        {
          class: 'whitespace-nowrap',
        },
        [
          h(
            'p',
            {
              class: 'font-mono text-sm tabular-nums text-foreground',
            },
            `${formatNumber(cargo.units)} / ${formatNumber(cargo.capacity)}`,
          ),

          h(
            'p',
            {
              class: 'mt-1 text-xs text-muted-foreground',
            },
            cargo.inventory.length === 1 ? '1 item type' : `${cargo.inventory.length} item types`,
          ),
        ],
      )
    },
  },
]
