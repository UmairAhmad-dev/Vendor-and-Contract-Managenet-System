# Vendor and Contract Management System

> A comprehensive web-based solution designed to streamline vendor relationships, contract lifecycle management, and budget oversight with a robust Node.js backend and MySQL database.

This platform is an end-to-end solution for efficient vendor and contract management, offering powerful CRUD functionalities, real-time tracking, and insightful reporting.

## Key Features

* **Vendor Management:** Comprehensive operations for vendor registration, profiles, and performance evaluation.

* **Contract Management:** Automated contract creation, renewal notifications, and status tracking.

* **Purchase Order Processing:** Efficient PO generation with automated budget compliance checks.

* **Budget Monitoring:** Dynamic allocation, tracking, and overspending prevention.

* **User Management & Authentication:** Secure role-based access for Managers, Vendors, and Teams.

* **Insightful Reporting:** Generate reports on vendor performance, contract renewals, and budget overview.

## Technologies Used

* **Backend:** Node.js, Express.js

* **Database:** MySQL

* **Frontend:** HTML, JavaScript, CSS

## Project Overview

This system comprises a Node.js/Express.js backend for API services, a MySQL database for data persistence, and a static HTML/JavaScript frontend for user interfaces. Detailed schema and code are available in the repository.

## Project Structure

```
Vendor-and-Contract-Managenet-System/
├── node_modules/     # Node.js dependencies
├── Diagrams/         # Contains diagrams like ERD
├── manager/          # Frontend HTML/JS for Manager role
├── team/             # Frontend HTML/JS for Team role
├── vendors/          # Frontend HTML/JS for Vendor role
├── login.html        # Main login page
├── purchase order.html # Example of a specific HTML page
├── server.js         # Backend Node.js/Express application
├── vendordb.sql      # MySQL database schema and seed data
├── package.json      # Node.js project metadata and dependencies
├── package-lock.json # Node.js dependency lock file
└── .gitignore        # Git ignore rules
```

## Getting Started

To set up and run the application:

1.  Clone the repository.

2.  Install Node.js dependencies (`npm install`).

3.  Set up the MySQL database using the `vendordb.sql` script found in the repository.

4.  Configure database connection details in `server.js`.

5.  Start the backend server (`node server.js`).

6.  Access the application via your web browser at `http://localhost:3000/manager`, `http://localhost:3000/team`, or `http://localhost:3000/vendor` using the provided role-based credentials.

## Contributing

We welcome contributions! Please fork the repository, create a feature branch, commit your changes with clear messages, and submit a pull request.

## Support & Contact

For support, bug reports, or feature requests, please refer to the issues and discussions sections of the repository or contact us directly.

* **Email**: www.fasiih@gmail.com

* **Bug Reports**: [Open an Issue](https://github.com/faseey/Vendor-and-Contract-Managenet-System/issues)

* **Feature Requests**: [Start a Discussion](https://github.com/faseey/Vendor-and-Contract-Managenet-System/discussions)

## Authors

* Fasih Khalil (FA23-BCS-282)

* Umair Ahmad (FA23-BCS-244)
