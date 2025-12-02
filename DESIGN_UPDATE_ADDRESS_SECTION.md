# Design Update: Address Details Section for Order Editing

## Overview
Add a new "Address & Delivery Details" section to the order details modal that allows users to:
- View current delivery address (if exists)
- Add address details via a popup modal
- Edit address details later
- Update recipient name and phone numbers
- All from the order details viewing screen

---

## Database Fields to Handle

The following fields from the `orders` table need to be captured and edited:

```
Recipient Information:
├─ recipient_name (varchar 100) - Recipient full name
├─ recipient_phone (varchar 15) - Primary phone number
└─ recipient_phone1 (varchar 15) - Alternative phone number

Delivery Address:
├─ delivery_line1 (varchar 200) - Address line 1 (street)
├─ delivery_line2 (varchar 200) - Address line 2 (apartment/unit)
├─ delivery_postal_code (varchar 20) - Postal/ZIP code
├─ delivery_city (varchar 100) - City name
├─ delivery_district (varchar 100) - District/County
└─ delivery_province (varchar 100) - State/Province/Region
```

---

## UI Design: Address Details Section

### Location in Order Details Modal
**Position:** After "Delivery Status" section, before "Order Summary & Payment"

```
Order Details Modal
├── Customer & Order Information (EXISTING)
├── Order Items (EXISTING)
├── Delivery Status (EXISTING)
│
└── ⭐ ADDRESS & DELIVERY DETAILS (NEW)
    ├── View current address
    ├── Add/Edit button
    └── Popup modal for editing
        ├── Recipient details form
        ├── Address form (6 fields)
        └── Action buttons (Save/Cancel)
│
├── Order Summary & Payment (EXISTING)
└── Action Buttons (EXISTING)
```

---

## Section 1: Address Display Card (Main View)

### When NO Address Exists

```
┌─ ADDRESS & DELIVERY DETAILS ───────────────────────────────┐
│                                                             │
│  📍 No delivery address added yet                          │
│                                                             │
│  [+ Add Delivery Address]                                  │
│                                                             │
│  💡 Hint: Add delivery details to track where order        │
│     should be shipped.                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### When Address Exists (View Mode)

```
┌─ ADDRESS & DELIVERY DETAILS ───────────────────────────────┐
│                                                             │
│  📦 RECIPIENT & DELIVERY INFO                              │
│                                                             │
│  Recipient Name: Ahmed Hassan                              │
│  📱 Phone: +94 777 123 456                                 │
│  📱 Alt Phone: +94 700 987 654                             │
│                                                             │
│  📍 DELIVERY ADDRESS                                        │
│                                                             │
│  Line 1:      123, Galle Road                              │
│  Line 2:      Apartment 5B                                 │
│  City:        Colombo                                      │
│  District:    Western Province                             │
│  Province:    Sri Lanka                                    │
│  Postal Code: 00600                                        │
│                                                             │
│  Complete Address:                                          │
│  123, Galle Road, Apartment 5B                             │
│  Colombo, Western Province, Sri Lanka - 00600             │
│                                                             │
│  ✓ Last Updated: 28 Nov 2025, 2:30 PM                     │
│                                                             │
│  [✏️ Edit Address]  [📋 Copy Address]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 2: Address Edit Popup Modal

### Modal Structure

```
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║  📍 DELIVERY ADDRESS & RECIPIENT DETAILS                       ║
║                                          [✕ Close]             ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ┌─ RECIPIENT INFORMATION ────────────────────────────────┐   ║
║  │                                                       │   ║
║  │  Recipient Name *                                     │   ║
║  │  [Ahmed Hassan                              ]         │   ║
║  │                                                       │   ║
║  │  Primary Phone Number *                               │   ║
║  │  [+94 777 123 456                          ]          │   ║
║  │  Format: +94 77X XXX XXX or 077X XXX XXX             │   ║
║  │                                                       │   ║
║  │  Alternative Phone Number                             │   ║
║  │  [+94 700 987 654                          ]          │   ║
║  │  (Optional - for alternate contact)                   │   ║
║  │                                                       │   ║
║  └───────────────────────────────────────────────────────┘   ║
║                                                                ║
║  ┌─ DELIVERY ADDRESS ─────────────────────────────────────┐   ║
║  │                                                       │   ║
║  │  Address Line 1 (Street Address) *                    │   ║
║  │  [123, Galle Road                         ]           │   ║
║  │  Example: House No, Street Name, Area                │   ║
║  │                                                       │   ║
║  │  Address Line 2 (Apartment/Unit)                      │   ║
║  │  [Apartment 5B                           ]            │   ║
║  │  (Optional - flat, suite, unit number)               │   ║
║  │                                                       │   ║
║  │  City *                                               │   ║
║  │  [Colombo                               ]             │   ║
║  │                                                       │   ║
║  │  District *                                           │   ║
║  │  [Western Province              ▼]                   │   ║
║  │  ├─ Western Province                                  │   ║
║  │  ├─ Central Province                                  │   ║
║  │  ├─ Southern Province                                 │   ║
║  │  ├─ Eastern Province                                  │   ║
║  │  ├─ Northern Province                                 │   ║
║  │  ├─ North Western Province                            │   ║
║  │  ├─ North Central Province                            │   ║
║  │  ├─ Uva Province                                      │   ║
║  │  └─ Sabaragamuwa Province                             │   ║
║  │                                                       │   ║
║  │  State/Province *                                     │   ║
║  │  [Sri Lanka                            ]              │   ║
║  │                                                       │   ║
║  │  Postal Code / ZIP *                                  │   ║
║  │  [00600                                 ]             │   ║
║  │  Format: 5 digits (e.g., 00600)                      │   ║
║  │                                                       │   ║
║  │  ✅ COMPLETE ADDRESS PREVIEW:                         │   ║
║  │  ┌──────────────────────────────────────────────┐    │   ║
║  │  │ 123, Galle Road, Apartment 5B               │    │   ║
║  │  │ Colombo, Western Province, Sri Lanka - 00600│    │   ║
║  │  └──────────────────────────────────────────────┘    │   ║
║  │                                                       │   ║
║  └───────────────────────────────────────────────────────┘   ║
║                                                                ║
║  ┌─ FORM STATUS ──────────────────────────────────────────┐   ║
║  │ ✓ All required fields filled                           │   ║
║  │ ✓ Address format looks valid                           │   ║
║  │ ✓ Phone numbers are valid                              │   ║
║  │ Ready to save                                          │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
║  [💾 Save Address]  [🔄 Clear Form]  [❌ Cancel]              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## Form Field Details & Validation

### 1. Recipient Name
```
Field: Recipient Name *
Type: Text Input
Max Length: 100 characters
Validation:
  ✓ Required
  ✓ Min 3 characters
  ✓ Max 100 characters
  ✓ Allow letters, numbers, spaces, hyphens
  ✓ Warn if different from customer name

Placeholder: "Ahmed Hassan"
Error: "Please enter recipient name (3-100 characters)"
```

### 2. Primary Phone Number
```
Field: Primary Phone Number *
Type: Text Input with Phone Format
Max Length: 15 characters
Validation:
  ✓ Required
  ✓ Phone format: +94 77X XXX XXX or 077X XXX XXX or 0777123456
  ✓ Must start with +94 7 or 07
  ✓ 9-15 characters allowed

Placeholder: "+94 777 123 456"
Error: "Invalid phone format. Use +94 77X XXX XXX or 077X XXX XXX"
Help: "Format: +94 77X XXX XXX or 077X XXX XXX"
```

### 3. Alternative Phone Number
```
Field: Alternative Phone Number
Type: Text Input with Phone Format
Max Length: 15 characters
Validation:
  ✓ Optional (can be empty)
  ✓ If provided, must follow same phone format as primary
  ✓ Cannot be same as primary phone

Placeholder: "+94 700 987 654"
Error: "Invalid phone format"
Help: "(Optional) Alternate contact number"
```

### 4. Address Line 1 (Street Address)
```
Field: Address Line 1 *
Type: Text Area / Text Input
Max Length: 200 characters
Validation:
  ✓ Required
  ✓ Min 5 characters
  ✓ Max 200 characters
  ✓ Allow letters, numbers, spaces, commas, hyphens, periods

Placeholder: "123, Galle Road, Colombo"
Error: "Please enter street address (5-200 characters)"
Help: "Example: House No, Street Name, Area"
```

### 5. Address Line 2 (Apartment/Unit)
```
Field: Address Line 2
Type: Text Input
Max Length: 200 characters
Validation:
  ✓ Optional (can be empty)
  ✓ If provided: Min 2, Max 200 characters
  ✓ Allow letters, numbers, spaces, hyphens, slashes

Placeholder: "Apartment 5B"
Error: "Please enter valid apartment/unit details"
Help: "(Optional) Flat, suite, unit number, etc."
```

### 6. City
```
Field: City *
Type: Text Input with Autocomplete
Max Length: 100 characters
Validation:
  ✓ Required
  ✓ Min 2 characters
  ✓ Max 100 characters
  ✓ Allow letters, spaces, hyphens

Placeholder: "Colombo"
Auto-suggestions: Common cities in selected province
Error: "Please enter city name"
```

### 7. District (Province Selection)
```
Field: District *
Type: Dropdown Select
Values: [Sri Lankan Districts/Provinces]

Validation:
  ✓ Required
  ✓ Must select from predefined list

Options:
  - Western Province
  - Central Province
  - Southern Province
  - Eastern Province
  - Northern Province
  - North Western Province
  - North Central Province
  - Uva Province
  - Sabaragamuwa Province

Error: "Please select a district/province"
Help: "Select district or province of delivery"
```

### 8. State/Province/Region
```
Field: State/Province/Region *
Type: Text Input
Max Length: 100 characters
Validation:
  ✓ Required (usually "Sri Lanka")
  ✓ Allow for international addresses in future

Placeholder: "Sri Lanka"
Default Value: "Sri Lanka"
Error: "Please enter state/province"
```

### 9. Postal Code / ZIP
```
Field: Postal Code / ZIP *
Type: Text Input with Format
Max Length: 20 characters
Validation:
  ✓ Required
  ✓ Format: 5 digits for Sri Lanka (e.g., 00600, 10100)
  ✓ Max 20 characters (for international compatibility)
  ✓ Alphanumeric allowed

Placeholder: "00600"
Format Help: "5 digits for Sri Lanka"
Error: "Invalid postal code format"
Pattern: /^\d{5}$/ for Sri Lanka
```

---

## Complete Address Preview

### Feature: Auto-generated Complete Address

```
As user fills the form, show real-time preview:

┌─────────────────────────────────────────┐
│ COMPLETE ADDRESS PREVIEW                │
├─────────────────────────────────────────┤
│                                         │
│ 123, Galle Road, Apartment 5B          │
│ Colombo, Western Province, Sri Lanka   │
│ Postal Code: 00600                      │
│                                         │
│ For Delivery Label:                     │
│ 123, Galle Road                         │
│ Apartment 5B                            │
│ Colombo 00600                           │
│ Western Province                        │
│ Sri Lanka                               │
│                                         │
└─────────────────────────────────────────┘
```

---

## Form States & Behaviors

### State 1: Empty Form (Adding New Address)
```
- All fields empty
- District dropdown default: "Select District"
- Province field: "Sri Lanka"
- Save button: DISABLED (gray)
- Message: "Fill in all required fields to continue"
- All fields have placeholders and help text
```

### State 2: Partially Filled
```
- Some required fields filled
- Save button: DISABLED (gray)
- Message: "Complete required fields to save"
- Red * on unfilled required fields
- Preview shows partial address
```

### State 3: All Required Fields Filled
```
- All required fields have values
- Optional fields may be empty
- Save button: ENABLED (blue)
- Message: "All required fields complete"
- Preview shows complete address
- Validation checks pass
```

### State 4: Validation Error
```
- At least one field has invalid value
- Save button: DISABLED (gray)
- Error message shown below invalid field
- Field highlighted in red
- Message: "Please fix errors before saving"
- Preview updates when corrections made
```

### State 5: Saving
```
- Save button: DISABLED with spinner
- All other buttons: DISABLED
- Message: "Saving address details..."
- No interaction allowed
- Modal stays open
```

### State 6: Save Success
```
- Success message: "✓ Address details saved!"
- Modal auto-closes after 1-2 seconds
- Returns to main order view
- Address card now shows saved details
- "Last Updated" timestamp updates
```

---

## Button Actions & Behaviors

### "Add Delivery Address" Button (When No Address)
```
Button: [+ Add Delivery Address]
State: Always enabled
Action: Opens address edit modal
Style: Primary button (blue)
Size: Full width
Icon: 📍 Plus icon
```

### "Edit Address" Button (When Address Exists)
```
Button: [✏️ Edit Address]
State: Always enabled
Action: Opens modal pre-filled with current address
Style: Secondary button (gray/blue)
Size: Fits with other buttons
Icon: ✏️ Pencil icon
```

### "Save Address" Button (In Modal)
```
Button: [💾 Save Address]
State:
  - DISABLED while form incomplete/invalid
  - DISABLED while saving
  - ENABLED when all required fields valid
Action: Validates form → Saves to database
Style: Primary button (green/blue)
Icon: 💾 Floppy disk icon
Feedback: Loading spinner during save
```

### "Clear Form" Button (In Modal)
```
Button: [🔄 Clear Form]
State: Always enabled
Action: Clears all fields (except default like "Sri Lanka")
Confirmation: Ask "Clear all fields?"
Style: Secondary button (gray)
Icon: 🔄 Refresh icon
```

### "Copy Address" Button (When Address Exists)
```
Button: [📋 Copy Address]
State: Always enabled
Action: Copies complete address to clipboard
Feedback: Toast message "Address copied!"
Style: Tertiary button
Icon: 📋 Copy icon
```

### "Cancel" Button (In Modal)
```
Button: [❌ Cancel]
State: Always enabled
Action: Closes modal without saving
Confirmation: If form modified, ask "Discard changes?"
Style: Secondary button (red)
Icon: ❌ X icon
```

---

## Integration Points

### In Order Details Modal Structure

```
Order Details Modal
├── Modal Header
│   ├── Title: "Order Details" / "Edit Order"
│   └── Close button
│
├── Modal Body (Scrollable)
│   ├── Section 1: Customer & Order Information
│   ├── Section 2: Order Items
│   ├── Section 3: Delivery Status
│   │
│   ├── ⭐ Section 4: ADDRESS & DELIVERY DETAILS (NEW)
│   │   ├── Address Display Card (or Empty State)
│   │   ├── Add/Edit Button
│   │   └── [Opens Popup Modal when clicked]
│   │       ├── Address Edit Modal (Nested)
│   │       │   ├── Recipient Form Fields
│   │       │   ├── Address Form Fields
│   │       │   ├── Complete Address Preview
│   │       │   └── Action Buttons
│   │       └── [Closes and returns to main modal]
│   │
│   ├── Section 5: Order Summary & Payment
│   ├── Section 6: Action Buttons
│   │
│   └── (Other sections...)
│
└── Modal Footer
    └── Close/Action buttons
```

---

## Data Flow: Address Management

### Creating New Address

```
User in Order Details Modal
    ↓
Clicks [+ Add Delivery Address]
    ↓
Address Edit Modal Opens (Empty Form)
    ↓
User fills form:
├─ Recipient Name
├─ Phone Numbers
├─ Address Fields
└─ Postal Code
    ↓
Real-time validation & preview updates
    ↓
User clicks [💾 Save Address]
    ↓
Validate all fields
    ↓
Send to API: POST /api/orders/:id/address
    ↓
Show loading spinner
    ↓
Success: Address saved ✓
    ↓
Modal closes
    ↓
Main modal refreshes to show address card
    ↓
Display address with "Last Updated" timestamp
```

### Editing Existing Address

```
User in Order Details Modal
    ↓
Sees Address Card with current details
    ↓
Clicks [✏️ Edit Address]
    ↓
Address Edit Modal Opens (Pre-filled with current address)
    ↓
User can:
├─ Modify any field
├─ See real-time preview updates
└─ Validate as they type
    ↓
User clicks [💾 Save Address]
    ↓
Validate all fields
    ↓
Send to API: PUT /api/orders/:id/address
    ↓
Show loading spinner
    ↓
Success: Address updated ✓
    ↓
Modal closes
    ↓
Main modal refreshes
    ↓
Address card shows updated details
    ↓
"Last Updated" timestamp changes
```

---

## Responsive Design

### Desktop (1200px+)
- Full modal width (500-600px)
- Two-column form layout possible
- Full preview section visible
- All buttons visible in one row

### Tablet (768px - 1199px)
- Modal takes 90% width
- Single column form
- Stack buttons vertically
- Preview wraps nicely

### Mobile (<768px)
- Full screen modal
- Single column form
- Field width: 100%
- Buttons stack vertically
- Touch-friendly input heights (44px min)
- Keyboard-aware positioning

---

## Success States & Feedback

### Save Success Message
```
┌─────────────────────────────┐
│ ✅ Address saved successfully│
│                             │
│ Updated: 28 Nov 2025, 3:45PM│
│                             │
│ Auto-close in 2 seconds...  │
└─────────────────────────────┘
```

### Validation Errors
```
Per-field errors appear below field:

Recipient Name [_____]
🔴 Please enter recipient name (3-100 characters)

Primary Phone [_____]
🔴 Invalid phone format. Use +94 77X XXX XXX
```

### Toast Notifications
```
"✅ Address copied to clipboard!"
"✅ Address updated successfully"
"❌ Error saving address. Please try again."
"⚠️ Changes will be lost. Continue?"
```

---

## Summary of Changes to Design

**Added Components:**
- Address Display Card (view mode)
- Address Edit Modal (popup)
- Form fields for recipient and address info
- Address preview section
- Validation feedback
- Status messages

**Modified Components:**
- Order Details Modal (now includes address section)
- Modal scrolling behavior (to accommodate new section)

**New Features:**
- Real-time address preview
- Phone number validation
- Postal code formatting
- District/Province dropdown
- Address copying to clipboard
- Form state management
- Real-time validation feedback

**Integration:**
- Fits naturally in order details modal
- Between Delivery Status and Order Summary
- Non-intrusive popup for editing
- Maintains existing functionality

---

## Implementation Checklist for Phase 2

**Frontend:**
- [ ] Create AddressEditModal component
- [ ] Add form validation logic
- [ ] Implement real-time preview
- [ ] Add success/error handling
- [ ] Handle modal open/close states
- [ ] Add clipboard copy functionality
- [ ] Implement responsive design
- [ ] Add form field auto-focus
- [ ] Keyboard navigation support

**Backend API Endpoints:**
- [ ] `POST /api/orders/:id/address` - Create/Update address
- [ ] `GET /api/orders/:id/address` - Get address details
- [ ] Validate address fields
- [ ] Update order with address info
- [ ] Return success/error response

**Database:**
- [ ] No schema changes needed (fields already exist)
- [ ] Ensure fields nullable for backward compatibility
- [ ] Add migration if needed for default values

**Testing:**
- [ ] Form validation with various inputs
- [ ] Save and edit functionality
- [ ] Modal open/close behavior
- [ ] Responsive on different devices
- [ ] Copy to clipboard functionality
- [ ] Error handling and messages

