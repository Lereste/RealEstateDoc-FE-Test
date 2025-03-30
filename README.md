# Lereste

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.5.

## Installation

To install dependencies, run:

```bash
npm install
```

## Development

### Start Client

To start the client application, run:

```bash
npm run start:client
```

Once running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any source files.

### Start Server

To start the backend server, run:

```bash
npm run start:server
```

The server will be available at `http://localhost:3000/`.

## Features

This application includes the following main features:
- **Search**: Quickly find products by name, type, category, ect.
- **Sort**: Organize products based on different criteria (price, name, etc.).
- **Refresh**: Reload product data to get the latest updates.
- **Add/Update Product**: Create new products or edit existing ones.
- **Soft Delete Product**: Mark products as deleted without permanently removing them.
- **Export/Import Data**: Basic JSON data export and import functionality.

**Note**: Sometimes sorting in Angular Material may not work properly when used with signals. If this happens, please restart both the client and server, then try again 😅.

## Additional Resources

For more information on using Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

