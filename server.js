const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use('/vendor', express.static(path.join(__dirname, 'vendors')));
app.use('/team', express.static(path.join(__dirname, 'team')));
app.use('/manager', express.static(path.join(__dirname, 'manager')));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'vendordb'
});

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// Routes

////////////////////CRUD FOR USERS//////////



//CREATE//
app.post('/register', (req, res) => {
  const { username, password, role } = req.body;

  // Validate inputs
  if (!username || !password || !role) {
    return res.status(400).send('All fields are required');
  }

  // Insert new user
  const sql = 'INSERT INTO Users (Username, Password, Role) VALUES (?, ?, ?)';
  db.query(sql, [username, password, role], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).send('Username already exists');
      }
      return res.status(500).send('Error registering user');
    }

    res.status(200).send('User registered successfully');
  });
});
//login
/////READ////
app.get('/users', (req, res) => {
  db.query('SELECT LoginID, Username, Role FROM LoginCredentials', (err, results) => {
    if (err) return res.status(500).send('Error fetching users');
    res.json(results);
  });
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM Users WHERE Username = ? AND Password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        // If no user found, send an error message with a 400 status
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      // If user found, extract the role and send it in the response
      const user = results[0]; // Assuming the query will return only one row
      return res.status(200).json({
        role: user.Role,  // Send the role in the response
        username: user.Username  // Optionally send the username if needed
      });
    }
  );
});



//Management team//
app.get('/Users', (req, res) => {
  const query = "SELECT * FROM Users WHERE Role = 'Manager'";
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// CRUD for Budgets


//READ//
app.get('/budgets', (req, res) => {
  db.query('SELECT * FROM Budgets', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
//CREATE//
app.post('/budgets', (req, res) => {
  const { AllocatedAmount, SpentAmount } = req.body;
   const allocated = parseInt(AllocatedAmount);
  const spent = parseInt(SpentAmount);

  if (spent > allocated) {
    return res.status(400).json({ error: 'Spent amount cannot exceed allocated amount.' });
  }
  db.query(
    'INSERT INTO Budgets (AllocatedAmount, SpentAmount) VALUES (?, ?)',
    [AllocatedAmount, SpentAmount],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Budget added successfully', BudgetID: results.insertId });
    }
  );
});

// Update //
app.put('/budgets/:id', (req, res) => {
  const { id } = req.params;
  const { AllocatedAmount, SpentAmount } = req.body;
  const allocated = parseInt(AllocatedAmount);
  const spent = parseInt(SpentAmount);

  if (spent > allocated) {
    return res.status(400).json({ error: 'Spent amount cannot exceed allocated amount.' });
  }
  db.query(
    'UPDATE Budgets SET AllocatedAmount = ?, SpentAmount = ? WHERE BudgetID = ?',
    [AllocatedAmount, SpentAmount, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Budget updated successfully' });
    }
  );
});

// Delete //
app.delete('/budgets/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Budgets WHERE BudgetID = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Budget deleted successfully' });
  });
});

// CRUD for Vendors
app.get('/vendors', (req, res) => {
  db.query('SELECT * FROM Vendors', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/vendors', (req, res) => {
  const { Name, ContactInfo, ServiceCategory, ComplianceCertification, PerformanceRating} = req.body;

  // Validate required fields
  if (!Name ) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  const query = `
    INSERT INTO Vendors (Name, ContactInfo, ServiceCategory, ComplianceCertification, PerformanceRating)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [Name, ContactInfo, ServiceCategory, ComplianceCertification, PerformanceRating], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to add vendor.', error: err.message });
    }
    res.status(200).json({ success: true, message: 'Vendor added successfully!', VendorID: results.insertId });
  });
});



// Update Vendor
app.put('/vendors/:id', (req, res) => {
  const vendorId = req.params.id;
  const { Name, ContactInfo, ServiceCategory, ComplianceCertification, PerformanceRating } = req.body;

  if (!Name) {
    return res.status(400).json({ success: false, message: 'Name is required.' });
  }

  const query = `
    UPDATE Vendors
    SET Name = ?, ContactInfo = ?, ServiceCategory = ?, ComplianceCertification = ?, PerformanceRating = ?
    WHERE VendorID = ?
  `;

  db.query(query, [Name, ContactInfo, ServiceCategory, ComplianceCertification, PerformanceRating, vendorId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to update vendor.', error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }
    res.status(200).json({ success: true, message: 'Vendor updated successfully.' });
  });
});

// Delete Vendor
app.delete('/vendors/:id', (req, res) => {
  const vendorId = req.params.id;

  db.query('DELETE FROM Vendors WHERE VendorID = ?', [vendorId], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Failed to delete vendor.', error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found.' });
    }
    res.status(200).json({ success: true, message: 'Vendor deleted successfully.' });
  });
});

// CRUD for Departments

//READ//
app.get('/departments', (req, res) => {
  db.query('SELECT * FROM Departments', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});
//CREATE
app.post('/departments', (req, res) => {
  const { Name, BudgetID } = req.body;
  db.query(
    'INSERT INTO Departments (Name, BudgetID) VALUES (?, ?)',
    [Name, BudgetID],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Department added successfully', DepartmentID: results.insertId });
    }
  );
});
//UPDATE
app.put('/departments/:id', (req, res) => {
  const { id } = req.params;
  const { Name, BudgetID } = req.body;

  db.query(
    'UPDATE Departments SET Name = ?, BudgetID = ? WHERE DepartmentID = ?',
    [Name, BudgetID, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Department not found' });
      }
      res.json({ message: 'Department updated successfully' });
    }
  );
});
//DELETE//
app.delete('/departments/:id', (req, res) => {
  const { id } = req.params;

  db.query(
    'DELETE FROM Departments WHERE DepartmentID = ?',
    [id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Department not found' });
      }
      res.json({ message: 'Department deleted successfully' });
    }
  );
});

// Report: Vendor Performance
app.get('/reports/vendorPerformance', (req, res) => {
  db.query('SELECT Name, PerformanceRating FROM Vendors', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Report: Contract Renewals
app.get('/reports/contractRenewals', (req, res) => {
  db.query(`
    SELECT Vendors.Name AS VendorName, Contracts.EndDate
    FROM Contracts
    INNER JOIN Vendors ON Vendors.VendorID = Contracts.VendorID
    WHERE DATEDIFF(Contracts.EndDate, CURDATE()) <= 30
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Report: Budget Overview
app.get('/reports/budgetOverview', (req, res) => {
  db.query(`
    SELECT Departments.Name, Budgets.RemainingAmount
    FROM Departments
    INNER JOIN Budgets ON Budgets.BudgetID = Departments.BudgetID
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// CRUD for Purchase Orders
app.get('/purchaseOrders', (req, res) => {
  db.query(
    `SELECT 
       PO.POID, 
       V.Name AS VendorName, 
       C.ContractName, 
       PO.ItemDetails, 
       PO.Quantity, 
       PO.TotalCost, 
       PO.Status 
     FROM PurchaseOrders PO
     INNER JOIN Vendors V ON PO.VendorID = V.VendorID
     INNER JOIN Contracts C ON PO.ContractID = C.ContractID`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
});

app.post('/purchaseOrders', (req, res) => {
  const { VendorID, ContractID, ItemDetails, Quantity, TotalCost, Status } = req.body;
  db.query(
    `INSERT INTO PurchaseOrders 
     (VendorID, ContractID, ItemDetails, Quantity, TotalCost, Status) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [VendorID, ContractID, ItemDetails, Quantity, TotalCost, Status || 'Pending'],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Purchase Order added successfully', POID: results.insertId });
    }
  );
});

app.put('/purchaseOrders/:id', (req, res) => {
  const { id } = req.params;
  const { VendorID, ContractID, ItemDetails, Quantity, TotalCost, Status } = req.body;
  db.query(
    `UPDATE PurchaseOrders 
     SET VendorID = ?, ContractID = ?, ItemDetails = ?, Quantity = ?, TotalCost = ?, Status = ? 
     WHERE POID = ?`,
    [VendorID, ContractID, ItemDetails, Quantity, TotalCost, Status, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Purchase Order updated successfully' });
    }
  );
});

app.delete('/purchaseOrders/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM PurchaseOrders WHERE POID = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Purchase Order deleted successfully' });
  });
});

// Get all contracts
app.get('/contracts', (req, res) => {
  db.query('SELECT * FROM Contracts', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results); // Send contracts data to the frontend
  });
});

// Add a new contract
app.post('/contracts', (req, res) => {
  const { ContractName, Status } = req.body;
  db.query(
    'INSERT INTO Contracts (ContractName, Status) VALUES (?, ?)',
    [ContractName, Status],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contract added successfully', ContractID: results.insertId });
    }
  );
});

// Update an existing contract
app.put('/contracts/:id', (req, res) => {
  const { id } = req.params;
  const { ContractName, Status } = req.body;
  db.query(
    'UPDATE Contracts SET ContractName = ?, Status = ? WHERE ContractID = ?',
    [ContractName, Status, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contract updated successfully' });
    }
  );
});

// Delete a contract
app.delete('/contracts/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Contracts WHERE ContractID = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Contract deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});