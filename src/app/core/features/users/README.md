# User Management Component

A comprehensive user management system for the pharmacy management application that allows administrators to create, view, edit, and manage system users.

## Features

### User Management
- **Create New Users**: Add new users with profile information, roles, and profile pictures
- **View All Users**: Display all users in a responsive grid layout with search and filtering
- **Edit Users**: Modify user information, roles, and profile pictures
- **Delete Users**: Remove users from the system with confirmation
- **User Details**: View detailed user information in a modal

### User Operations
- **Role Management**: Assign and remove roles from users
- **Status Management**: Activate/deactivate user accounts
- **Password Management**: Change user passwords
- **Profile Pictures**: Upload and manage user profile pictures

### Search and Filtering
- **Search**: Search users by name, username, email, or full name
- **Role Filter**: Filter users by specific roles (Admin, Master, Employee, Doctor, Patient)
- **Status Filter**: Filter users by active/inactive status
- **Clear Filters**: Reset all filters to show all users

## Component Structure

```
user-management/
├── user-management.component.ts    # Main component logic
├── user-management.component.html  # Template with modals and forms
├── user-management.component.css   # Styling and responsive design
└── README.md                      # This documentation
```

## Usage

### Navigation
Access the user management component at: `/admin/users`

### Creating a New User
1. Click the "Create New User" button
2. Fill in the required fields:
   - Username (3-50 characters)
   - Email (valid email format)
   - First Name (2-50 characters)
   - Last Name (2-50 characters)
   - Password (minimum 6 characters)
   - Confirm Password
   - Phone Number (optional)
   - Roles (select one or more)
   - Profile Picture (optional)
3. Click "Create User"

### Editing a User
1. Click the edit button (pencil icon) on any user card
2. Modify the desired fields
3. Click "Update User"

### Managing User Roles
- **Add Role**: Click the "+" button next to roles and select a role
- **Remove Role**: Click the "×" button on any role badge

### Changing User Status
- Click the "Activate" or "Deactivate" button on user cards
- Active users have a green status indicator, inactive users have red

### Changing User Password
1. Click the "Change Password" button on any user card
2. Enter the current password
3. Enter and confirm the new password
4. Click "Change Password"

## API Endpoints

The component uses the following endpoints from `AccountService`:

- `GET /Account/AllUsers` - Get all users
- `GET /Account/User/{id}` - Get user by ID
- `POST /Account/CreateUser` - Create new user
- `PUT /Account/UpdateUser` - Update user
- `DELETE /Account/DeleteUser/{id}` - Delete user
- `POST /Account/ChangePassword` - Change user password
- `POST /Account/ActivateUser/{id}` - Activate user
- `POST /Account/DeactivateUser/{id}` - Deactivate user
- `POST /Account/AssignRole` - Assign role to user
- `POST /Account/RemoveRole` - Remove role from user

## Data Models

### UserViewDTO
```typescript
interface UserViewDTO {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  profilePicture: string | null;
  phoneNumber: string | null;
  roles: string[];
  lastLoginDate: string | null;
}
```

### CreateUserDTO
```typescript
interface CreateUserDTO {
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  profilePicture?: File;
  roles: string[];
}
```

### UpdateUserDTO
```typescript
interface UpdateUserDTO {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePicture?: File;
  isActive: boolean;
  roles: string[];
}
```

## Available Roles

- **Admin**: Full system access
- **Master**: Master level access
- **Employee**: Employee access
- **Doctor**: Doctor access
- **Patient**: Patient access

## Responsive Design

The component is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Security Features

- Password confirmation validation
- Form validation with error messages
- Confirmation dialogs for destructive actions
- Role-based access control
- Input sanitization and validation

## Dependencies

- Angular Forms (ReactiveFormsModule, FormsModule)
- Angular Common (CommonModule)
- AccountService for API communication
- Font Awesome icons (fas)

## Styling

The component uses a modern, clean design with:
- Gradient headers
- Card-based layouts
- Hover effects and transitions
- Color-coded badges for roles and status
- Modal dialogs for forms and confirmations
- Responsive grid layouts 