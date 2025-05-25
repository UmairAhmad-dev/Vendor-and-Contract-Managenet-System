-- Delete the existing database if it exists
DROP DATABASE IF EXISTS vendordb;

-- Create the new database
CREATE DATABASE IF NOT EXISTS vendordb;
USE vendordb;

-- 1. Budgets Table
CREATE TABLE Budgets (
    BudgetID INT AUTO_INCREMENT PRIMARY KEY,
    AllocatedAmount DECIMAL(15, 2) NOT NULL,
    SpentAmount DECIMAL(15, 2) DEFAULT 0.00,
    RemainingAmount DECIMAL(15, 2) GENERATED ALWAYS AS (AllocatedAmount - SpentAmount) STORED
);

-- 2. Departments Table
CREATE TABLE Departments (
    DepartmentID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    BudgetID INT UNIQUE NOT NULL,
    FOREIGN KEY (BudgetID) REFERENCES Budgets(BudgetID) ON DELETE CASCADE
);

-- 3. Vendors Table
CREATE TABLE Vendors (
    VendorID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    ContactInfo VARCHAR(255),
    ServiceCategory VARCHAR(100),
    ComplianceCertification BOOLEAN DEFAULT FALSE,
    PerformanceRating DECIMAL(3, 2) CHECK (PerformanceRating BETWEEN 0 AND 5)
);

-- 4. Contracts Table
CREATE TABLE Contracts (
    ContractID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    DepartmentID INT NOT NULL,
    TermsAndConditions TEXT,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Status ENUM('Active', 'Expired', 'Renewal Pending') DEFAULT 'Active',
    FOREIGN KEY (VendorID) REFERENCES Vendors(VendorID) ON DELETE CASCADE,
    FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID) ON DELETE CASCADE
);

-- 5. PurchaseOrders Table
CREATE TABLE PurchaseOrders (
    POID INT AUTO_INCREMENT PRIMARY KEY,
    VendorID INT NOT NULL,
    ContractID INT NOT NULL,
    ItemDetails TEXT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    TotalCost DECIMAL(10, 2) NOT NULL CHECK (TotalCost > 0),
    Status ENUM('Pending', 'Completed', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (VendorID) REFERENCES Vendors(VendorID) ON DELETE CASCADE,
    FOREIGN KEY (ContractID) REFERENCES Contracts(ContractID) ON DELETE CASCADE
);

-- 6. Users Table
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('Vendor', 'Manager', 'Team') DEFAULT 'Team'
);

-- 7. Create LoginCredentials Table (optional)
-- If you want a separate login credentials table, this can be kept optional.
CREATE TABLE LoginCredentials (
    LoginID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('Vendor', 'Manager', 'Team') DEFAULT 'Team'
);




-- 8. Triggers
CREATE TABLE IF NOT EXISTS Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    Message TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Set delimiter to $$ to allow semicolons inside the trigger body
DELIMITER $$

CREATE TRIGGER ContractRenewalTrigger
AFTER INSERT ON Contracts
FOR EACH ROW
BEGIN
    IF DATEDIFF(NEW.EndDate, CURDATE()) <= 30 THEN
        INSERT INTO Notifications (Message) VALUES ('Contract nearing expiration!');
    END IF;
END $$

-- Reset delimiter to the default semicolon
DELIMITER ;


-- Set the delimiter to $$ to allow semicolons inside the trigger
DELIMITER $$

CREATE TRIGGER BudgetCheckTrigger
BEFORE INSERT ON PurchaseOrders
FOR EACH ROW
BEGIN
    DECLARE remaining DECIMAL(15, 2);
    
    -- Get the department's remaining budget by joining with the Contracts table
    SELECT RemainingAmount INTO remaining
    FROM Budgets 
    WHERE BudgetID = (SELECT BudgetID FROM Departments WHERE DepartmentID = (SELECT DepartmentID FROM Contracts WHERE ContractID = NEW.ContractID));
    
    -- Check if the purchase order exceeds the budget
    IF NEW.TotalCost > remaining THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Purchase order exceeds department budget!';
    END IF;
END $$

-- Reset the delimiter to the default semicolon
DELIMITER ;
users

-- Stored Procedure for Vendor Registration
DELIMITER $$

CREATE PROCEDURE RegisterVendor(
    IN p_name VARCHAR(100),
    IN p_contactInfo VARCHAR(255),
    IN p_category VARCHAR(100),
    IN p_compliance BOOLEAN
)
BEGIN
    INSERT INTO Vendors (Name, ContactInfo, ServiceCategory, ComplianceCertification)
    VALUES (p_name, p_contactInfo, p_category, p_compliance);
END $$

DELIMITER ;

-- Stored Procedure for Contract Renewal
DELIMITER $$

CREATE PROCEDURE RenewContract(
    IN p_contractID INT,
    IN p_endDate DATE
)
BEGIN
    UPDATE Contracts
    SET EndDate = p_endDate, Status = 'Renewal Pending'
    WHERE ContractID = p_contractID;
END $$

DELIMITER ;

-- Stored Procedure for Vendor Performance Evaluation
DELIMITER $$

CREATE PROCEDURE EvaluateVendorPerformance(
    IN p_vendorID INT,
    IN p_performance DECIMAL(3,2)
)
BEGIN
    UPDATE Vendors
    SET PerformanceRating = p_performance
    WHERE VendorID = p_vendorID;
END $$

DELIMITER ;

INSERT INTO Budgets (AllocatedAmount, SpentAmount)
VALUES 
(100000, 20000),
(150000, 50000),
(120000, 30000),
(180000, 40000),
(200000, 10000);

INSERT INTO Departments (Name, BudgetID)
VALUES 
('HR Department', 2),
('Finance Department', 3),
('Marketing Department', 4),
('Operations Department', 5),
('IT Department', 1);

INSERT INTO Vendors (Name, ContactInfo, ServiceCategory, ComplianceCertification, PerformanceRating)
VALUES 
('Vendor B', '+9876543210', 'Consulting', TRUE, 4.5),
('Vendor C', '+1122334455', 'Hardware Supply', FALSE, 3.8),
('Vendor D', '+5566778899', 'Software Development', TRUE, 4.2),
('Vendor E', '+7788990011', 'Security Services', FALSE, 3.5),
('Vendor F', '+9911223344', 'Marketing', TRUE, 4.7);

INSERT INTO Contracts (VendorID, DepartmentID, TermsAndConditions, StartDate, EndDate, Status)
VALUES 
(2, 2, 'Consulting services contract terms...', '2025-02-01', '2025-12-01', 'Active'),
(3, 3, 'Hardware supply contract terms...', '2025-03-01', '2025-11-30', 'Active'),
(4, 4, 'Software development contract terms...', '2025-04-01', '2025-04-18', 'Renewal Pending'),
(5, 5, 'Security services contract terms...', '2025-01-01', '2025-1-15', 'Renewal Pending'),
(1, 1, 'Marketing services contract terms...', '2025-05-01', '2025-08-01', 'Active');

INSERT INTO PurchaseOrders (VendorID, ContractID, ItemDetails, Quantity, TotalCost, Status)
VALUES 
(2, 1, 'Consulting Hours', 100, 20000, 'Pending'),
(3, 2, 'Desktops', 15, 15000, 'Completed'),
(4, 3, 'Custom Software Module', 1, 25000, 'Pending'),
(5, 4, 'Security Cameras', 10, 12000, 'Pending'),
(1, 5, 'Marketing Campaign', 1, 5000, 'Cancelled');

INSERT INTO Users (Username, Password, Role)
VALUES 
('fasih', 'password1', 'Manager'),
('umari', 'password2', 'Vendor'),
('qasim', 'password3', 'Team'),
('manager2', 'password4', 'Manager'),
('amd', 'password5', 'Vendor');

INSERT INTO LoginCredentials (Username, Password, Role)
VALUES 
('fasih', 'password1', 'Manager'),
('umair', 'password2', 'Vendor'),
('qasim', 'password3', 'Team'),
('manager2', 'password4', 'Manager'),
('amd', 'password5', 'Vendor');

select * from  Users where Role = 'Manager';
Select * from Vendors;
