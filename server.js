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

//CRUD for Purchase Orders
app.get('/purchaseOrders', (req, res) => {
  db.query(
    `SELECT 
       PO.POID, 
       V.Name AS VendorName, 
       C.TermsAndConditions, 
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

  if (!VendorID || !ContractID || !ItemDetails || !Quantity || !TotalCost || !Status) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  db.query(
    `UPDATE PurchaseOrders 
     SET VendorID = ?, ContractID = ?, ItemDetails = ?, Quantity = ?, TotalCost = ?, Status = ? 
     WHERE POID = ?`,
    [VendorID, ContractID, ItemDetails, Quantity, TotalCost, Status, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'No record found with this ID' });
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


// Get all contracts with vendor names
  app.get('/contracts', (req, res) => {
    const sql = `
SELECT 
        Contracts.ContractID,
        Vendors.Name as VendorName,
        Departments.Name as DepartmentName,
        Contracts.TermsAndConditions,
        Contracts.StartDate,
        Contracts.EndDate,
        Contracts.Status
      FROM Contracts
      JOIN Vendors ON Contracts.VendorID = Vendors.VendorID
      JOIN Departments ON Contracts.DepartmentID = Departments.DepartmentID
    `;

    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });



app.post('/contracts', (req, res) => {
  const { VendorID, DepartmentID, TermsAndConditions, StartDate, EndDate, Status } = req.body;

  if (!VendorID || !DepartmentID || !StartDate || !EndDate) {
    return res.status(400).json({ error: 'VendorID, DepartmentID, StartDate and EndDate are required.' });
  }

  const contractStatus = Status || 'Active'; // default value

  const sql = `
    INSERT INTO Contracts 
    (VendorID, DepartmentID, TermsAndConditions, StartDate, EndDate, Status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [VendorID, DepartmentID, TermsAndConditions || '', StartDate, EndDate, contractStatus],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contract added successfully', ContractID: results.insertId });
    }
  );
});


app.get('/contracts/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM Contracts WHERE ContractID = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(results[0]);
  });
});


app.put('/contracts/:id', (req, res) => {
  const { id } = req.params;
  const { VendorID, TermsAndConditions, StartDate, EndDate, Status } = req.body;

  // Validate required fields
  if (!VendorID || !TermsAndConditions || !StartDate || !EndDate || !Status) {
    return res.status(400).json({ error: 'Missing fields in request body' });
  }

  // Update the contract
  db.query(
    `UPDATE Contracts 
     SET VendorID = ?, TermsAndConditions = ?, StartDate = ?, EndDate = ?, Status = ?
     WHERE ContractID = ?`,
    [VendorID, TermsAndConditions, StartDate, EndDate, Status, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'No contract found with this ID' });
      }

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

//Notifications
app.get('/notifications', (req, res) => {
  db.query('SELECT * FROM Notifications ORDER BY CreatedAt DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json(results);
  });
});

function parseDateOnly(dateString) {
  // Expecting dateString in YYYY-MM-DD format, e.g. '2024-04-05'
  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // JS months 0-based
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

app.post('/contracts/renew', (req, res) => {
  const { contractID, endDate } = req.body;

  if (!contractID || !endDate) {
    return res.status(400).json({ error: 'contractID and endDate are required' });
  }

  const today = new Date();
  const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const newEndDate = parseDateOnly(endDate);

  console.log('Today:', todayNoTime);
  console.log('New End Date:', newEndDate);

  const diffMs = newEndDate - todayNoTime;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  console.log('Difference in days:', diffDays);

  let newStatus = '';

  if (diffDays < 0) {
    newStatus = 'Expired';
  } else if (diffDays <= 30) {
    newStatus = 'Renewal';
  } else {
    newStatus = 'Active';
  }

  console.log('New status to set:', newStatus);

  const sql = `
    UPDATE Contracts
    SET EndDate = ?, Status = ?
    WHERE ContractID = ?
  `;

  db.query(sql, [endDate, newStatus, contractID], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ message: 'Contract renewed and status updated successfully', status: newStatus });
  });
});


app.post('/vendors/evaluate', (req, res) => {
  const { vendorID, performance } = req.body;

  if (!vendorID || performance === undefined) {
    return res.status(400).json({ error: 'Missing vendorID or performance value' });
  }

  db.query('CALL EvaluateVendorPerformance(?, ?)', [vendorID, performance], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: 'Vendor performance updated successfully', results });
  });
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
