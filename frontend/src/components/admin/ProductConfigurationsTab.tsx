'use client'

const ADDON_TYPE_OPTIONS = ['SELECT', 'TOGGLE', 'TEXT_INPUT'] as const

export interface SizeRow {
  id?: string
  label: string
  priceModifier: number
  priceOverride: number | null
  sku: string
  isAvailable: boolean
  sortOrder: number
}

export interface AddonOptionRow {
  id?: string
  label: string
  priceModifier: number
  sortOrder: number
}

export interface AddonRow {
  id?: string
  name: string
  type: (typeof ADDON_TYPE_OPTIONS)[number]
  price: number
  isRequired: boolean
  sortOrder: number
  options: AddonOptionRow[]
}

export function emptySizeRow(sortOrder: number): SizeRow {
  return { label: '', priceModifier: 0, priceOverride: null, sku: '', isAvailable: true, sortOrder }
}

export function emptyAddonRow(sortOrder: number): AddonRow {
  return { name: '', type: 'SELECT', price: 0, isRequired: false, sortOrder, options: [] }
}

function formatAddonTypeLabel(type: (typeof ADDON_TYPE_OPTIONS)[number]): string {
  switch (type) {
    case 'SELECT':
      return 'Dropdown choices'
    case 'TOGGLE':
      return 'Yes / No'
    case 'TEXT_INPUT':
      return 'Free text'
  }
}

interface PresetAddonTemplate {
  name: string
  isRequired: boolean
  options: { label: string; priceModifier: number }[]
}

/**
 * The 6 option groups every bed product page used to ship with hardcoded
 * (Ottoman Storage, Delivery Service, Blanket Box, Split Head, Headboard
 * Height, Delay Delivery). Now offered as ready-made templates an admin can
 * flip on per product — off by default — rather than typing them out by hand
 * each time. Flipping one on just appends a normal, fully editable addon row
 * pre-filled with these choices/prices; nothing here is otherwise special.
 */
const PRESET_ADDON_GROUPS: PresetAddonTemplate[] = [
  {
    name: 'Would you like to add ottoman storage to your bed?',
    isRequired: true,
    options: [
      { label: 'No Storage', priceModifier: 0 },
      { label: 'Yes — Add Ottoman Storage', priceModifier: 0 },
    ],
  },
  {
    name: 'Delivery Service',
    isRequired: true,
    options: [
      { label: 'Downstairs Drop Off (FREE)', priceModifier: 0 },
      { label: 'Room of Choice Drop Off', priceModifier: 19.99 },
      { label: 'Room of Choice Assembly', priceModifier: 49.99 },
    ],
  },
  {
    name: 'Add a Matching Design Blanket Box',
    isRequired: false,
    options: [
      { label: 'No Thanks', priceModifier: 0 },
      { label: 'Yes 40" Storage Box', priceModifier: 99.99 },
      { label: 'Yes 60" Storage Box', priceModifier: 139.99 },
    ],
  },
  {
    name: 'Awkward Staircase? Get a Split Head',
    isRequired: false,
    options: [
      { label: 'No, I have checked my staircase, 1 Part Headboard will fit', priceModifier: 0 },
      { label: 'Yes, please split my headboard', priceModifier: 0 },
    ],
  },
  {
    name: 'Choose Headboard Height',
    isRequired: false,
    options: [
      { label: 'Standard 48 Inches', priceModifier: 0 },
      { label: 'Low 44 Inches', priceModifier: 0 },
      { label: 'Medium 54 Inches', priceModifier: 0 },
      { label: 'High 60 Inches', priceModifier: 79.99 },
      { label: 'Bespoke / Floor-Ceiling', priceModifier: 199.99 },
    ],
  },
  {
    name: 'Delay the Delivery?',
    isRequired: false,
    options: [
      { label: 'No thanks', priceModifier: 0 },
      { label: 'Yes, hold until further instructions', priceModifier: 0 },
    ],
  },
]

function presetToAddonRow(preset: PresetAddonTemplate, sortOrder: number): AddonRow {
  return {
    name: preset.name,
    type: 'SELECT',
    price: 0,
    isRequired: preset.isRequired,
    sortOrder,
    options: preset.options.map((option, i) => ({ label: option.label, priceModifier: option.priceModifier, sortOrder: i })),
  }
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#b87333]' : 'bg-stone-300'}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-[22px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

function addonOptionPreviewLabel(option: { label: string; priceModifier: number }): string {
  return option.priceModifier > 0 ? `${option.label} (+£${option.priceModifier})` : option.label
}

/**
 * The full name/type/price/required/choices editor for one addon group.
 * Shared by the Premade Groups list (once a preset is switched on) and the
 * custom Option Groups list below, so there is exactly one place to edit a
 * group's options — never a read-only duplicate.
 */
function AddonGroupEditor({
  addon,
  onUpdate,
  onRemove,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
  removeLabel = 'Remove Group',
}: {
  addon: AddonRow
  onUpdate: (patch: Partial<AddonRow>) => void
  onRemove: () => void
  onAddOption: () => void
  onUpdateOption: (optionIndex: number, patch: Partial<AddonOptionRow>) => void
  onRemoveOption: (optionIndex: number) => void
  removeLabel?: string
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-stone-200 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto_auto]">
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          Group Name
          <input
            type="text"
            value={addon.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Delivery Service"
            className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          Type
          <select
            value={addon.type}
            onChange={(e) => onUpdate({ type: e.target.value as AddonRow['type'] })}
            className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
          >
            {ADDON_TYPE_OPTIONS.map((type) => (
              <option key={type} value={type}>
                {formatAddonTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>
        {addon.type !== 'SELECT' && (
          <label className="flex flex-col gap-1 text-xs text-stone-500">
            Price (£)
            <input
              type="number"
              step="0.01"
              value={addon.price}
              onChange={(e) => onUpdate({ price: Number(e.target.value) || 0 })}
              className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
            />
          </label>
        )}
        <label className="flex items-end gap-2 pb-1 text-xs text-stone-500">
          <input
            type="checkbox"
            checked={addon.isRequired}
            onChange={(e) => onUpdate({ isRequired: e.target.checked })}
            className="h-4 w-4 rounded border-stone-300 accent-[#b87333]"
          />
          Required
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="h-9 self-end rounded-md border border-stone-300 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
        >
          {removeLabel}
        </button>
      </div>

      {addon.type === 'SELECT' && (
        <div className="flex flex-col gap-2 border-t border-stone-100 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-600">Choices</span>
            <button
              type="button"
              onClick={onAddOption}
              className="rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              Add Choice
            </button>
          </div>
          {addon.options.length === 0 ? (
            <p className="text-xs text-stone-400">No choices yet — this group needs at least one.</p>
          ) : (
            addon.options.map((option, optionIndex) => (
              <div key={option.id ?? optionIndex} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_auto]">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => onUpdateOption(optionIndex, { label: e.target.value })}
                  placeholder="e.g. Downstairs Drop Off"
                  className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
                />
                <input
                  type="number"
                  step="0.01"
                  value={option.priceModifier}
                  onChange={(e) => onUpdateOption(optionIndex, { priceModifier: Number(e.target.value) || 0 })}
                  placeholder="Price (£)"
                  className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
                />
                <button
                  type="button"
                  onClick={() => onRemoveOption(optionIndex)}
                  className="h-9 rounded-md border border-stone-300 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface ProductConfigurationsTabProps {
  sizes: SizeRow[]
  onSizesChange: (sizes: SizeRow[]) => void
  addons: AddonRow[]
  onAddonsChange: (addons: AddonRow[]) => void
}

/**
 * Admin CRUD for a bed's per-product Configurations: multiple purchasable
 * Sizes (backs the storefront Size dropdown + pricing formula) and freeform
 * Addon groups (Ottoman Storage, Delivery Service, Blanket Box, Split Head,
 * Headboard Height, Delay Delivery, ...) — each group and each choice within
 * it can be freely added/removed per product, nothing is a fixed list.
 */
export function ProductConfigurationsTab({ sizes, onSizesChange, addons, onAddonsChange }: ProductConfigurationsTabProps) {
  function addSize() {
    onSizesChange([...sizes, emptySizeRow(sizes.length)])
  }
  function updateSize(index: number, patch: Partial<SizeRow>) {
    onSizesChange(sizes.map((size, i) => (i === index ? { ...size, ...patch } : size)))
  }
  function removeSize(index: number) {
    onSizesChange(sizes.filter((_, i) => i !== index))
  }

  function addAddon() {
    onAddonsChange([...addons, emptyAddonRow(addons.length)])
  }
  function togglePreset(preset: PresetAddonTemplate, active: boolean) {
    if (active) {
      onAddonsChange([...addons, presetToAddonRow(preset, addons.length)])
    } else {
      onAddonsChange(addons.filter((addon) => addon.name !== preset.name))
    }
  }
  function updateAddon(index: number, patch: Partial<AddonRow>) {
    onAddonsChange(addons.map((addon, i) => (i === index ? { ...addon, ...patch } : addon)))
  }
  function removeAddon(index: number) {
    onAddonsChange(addons.filter((_, i) => i !== index))
  }

  function addOption(addonIndex: number) {
    const addon = addons[addonIndex]
    updateAddon(addonIndex, { options: [...addon.options, { label: '', priceModifier: 0, sortOrder: addon.options.length }] })
  }
  function updateOption(addonIndex: number, optionIndex: number, patch: Partial<AddonOptionRow>) {
    const addon = addons[addonIndex]
    updateAddon(addonIndex, {
      options: addon.options.map((option, i) => (i === optionIndex ? { ...option, ...patch } : option)),
    })
  }
  const presetNames = new Set(PRESET_ADDON_GROUPS.map((preset) => preset.name))
  const customAddonIndexes = addons
    .map((addon, addonIndex) => addonIndex)
    .filter((addonIndex) => !presetNames.has(addons[addonIndex].name))

  function removeOption(addonIndex: number, optionIndex: number) {
    const addon = addons[addonIndex]
    updateAddon(addonIndex, { options: addon.options.filter((_, i) => i !== optionIndex) })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Sizes ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-stone-900">Sizes</h2>
            <p className="text-xs text-stone-500">
              Each size becomes a storefront "Size" dropdown choice. Price = base price + this size&apos;s modifier
              (or the override, if set).
            </p>
          </div>
          <button
            type="button"
            onClick={addSize}
            className="h-9 shrink-0 rounded-lg bg-[#b87333] px-4 text-xs font-medium text-white transition-colors hover:bg-[#a3662e]"
          >
            Add Size
          </button>
        </div>

        {sizes.length === 0 ? (
          <p className="text-sm text-stone-500">No sizes yet. Add one to let customers choose a size.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {sizes.map((size, index) => (
              <div key={size.id ?? index} className="grid grid-cols-1 gap-3 rounded-lg border border-stone-200 p-3 sm:grid-cols-[1.5fr_1fr_1fr_auto_auto]">
                <label className="flex flex-col gap-1 text-xs text-stone-500">
                  Label
                  <input
                    type="text"
                    value={size.label}
                    onChange={(e) => updateSize(index, { label: e.target.value })}
                    placeholder="e.g. 4' Small Double"
                    className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-stone-500">
                  Price Modifier (£)
                  <input
                    type="number"
                    step="0.01"
                    value={size.priceModifier}
                    onChange={(e) => updateSize(index, { priceModifier: Number(e.target.value) || 0 })}
                    className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-stone-500">
                  SKU
                  <input
                    type="text"
                    value={size.sku}
                    onChange={(e) => updateSize(index, { sku: e.target.value })}
                    className="h-9 rounded-md border border-stone-300 px-2 text-sm text-stone-900 outline-none focus:border-[#b87333]"
                  />
                </label>
                <label className="flex items-end gap-2 pb-1 text-xs text-stone-500">
                  <input
                    type="checkbox"
                    checked={size.isAvailable}
                    onChange={(e) => updateSize(index, { isAvailable: e.target.checked })}
                    className="h-4 w-4 rounded border-stone-300 accent-[#b87333]"
                  />
                  Available
                </label>
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="h-9 self-end rounded-md border border-stone-300 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Option Groups (addons) ── */}
      <div className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-stone-900">Option Groups</h2>
            <p className="text-xs text-stone-500">
              e.g. Ottoman Storage, Delivery Service, Blanket Box, Split Head, Headboard Height, Delay Delivery. Add
              or remove groups and choices freely — nothing here is fixed.
            </p>
          </div>
          <button
            type="button"
            onClick={addAddon}
            className="h-9 shrink-0 rounded-lg bg-[#b87333] px-4 text-xs font-medium text-white transition-colors hover:bg-[#a3662e]"
          >
            Add Group
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-xs font-medium text-stone-700">Premade Groups</h3>
            <p className="text-xs text-stone-500">
              Flip one on to add it pre-filled with its standard choices and prices — off by default on a new
              product. Its choices stay editable right here once it&apos;s on.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {PRESET_ADDON_GROUPS.map((preset) => {
              const addonIndex = addons.findIndex((addon) => addon.name === preset.name)
              const active = addonIndex !== -1
              return (
                <div key={preset.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 px-4 py-3">
                    <span className="text-sm text-stone-700">{preset.name}</span>
                    <ToggleSwitch checked={active} onChange={(next) => togglePreset(preset, next)} />
                  </div>
                  {active ? (
                    <AddonGroupEditor
                      addon={addons[addonIndex]}
                      removeLabel="Turn Off"
                      onUpdate={(patch) => updateAddon(addonIndex, patch)}
                      onRemove={() => togglePreset(preset, false)}
                      onAddOption={() => addOption(addonIndex)}
                      onUpdateOption={(optionIndex, patch) => updateOption(addonIndex, optionIndex, patch)}
                      onRemoveOption={(optionIndex) => removeOption(addonIndex, optionIndex)}
                    />
                  ) : (
                    <p className="px-1 text-xs text-stone-400">
                      {preset.options.map(addonOptionPreviewLabel).join(' · ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-stone-100 pt-4">
          <h3 className="text-xs font-medium text-stone-700">Custom Groups</h3>
          {customAddonIndexes.length === 0 ? (
            <p className="text-sm text-stone-500">
              No custom option groups yet — use &quot;Add Group&quot; above for anything not covered by a premade one.
            </p>
          ) : (
            <div className="flex flex-col gap-5">
              {customAddonIndexes.map((addonIndex) => (
                <AddonGroupEditor
                  key={addons[addonIndex].id ?? addonIndex}
                  addon={addons[addonIndex]}
                  onUpdate={(patch) => updateAddon(addonIndex, patch)}
                  onRemove={() => removeAddon(addonIndex)}
                  onAddOption={() => addOption(addonIndex)}
                  onUpdateOption={(optionIndex, patch) => updateOption(addonIndex, optionIndex, patch)}
                  onRemoveOption={(optionIndex) => removeOption(addonIndex, optionIndex)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
