const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Mock PAKISTAN_CITIES
const PAKISTAN_CITIES = ["KARACHI", "LAHORE", "ISLAMABAD", "FAISALABAD", "RAWALPINDI"];

async function testExport() {
    const workbook = new ExcelJS.Workbook();
    
    // 1. Create a Hidden Sheet for Reference
    const citiesSheet = workbook.addWorksheet('Cities');
    citiesSheet.state = 'hidden';
    
    PAKISTAN_CITIES.forEach((city, index) => {
      citiesSheet.getCell(`A${index + 1}`).value = city;
    });

    // 2. Main 'Orders' sheet
    const ordersSheet = workbook.addWorksheet('Orders');

    const headers = [
      'ConsigneeName', 'ConsigneeAddress', 'ConsigneeCity'
    ];
    
    ordersSheet.getRow(1).values = headers;

    const mockOrders = [
        { customerName: 'Test User 1', address: '123 Street', customerCity: 'KARACHI' },
        { customerName: 'Test User 2', address: '456 Avenue', customerCity: 'Unknown' }
    ];

    mockOrders.forEach((order, index) => {
      const rowIndex = index + 2;
      const row = ordersSheet.getRow(rowIndex);
      
      let city = order.customerCity;
      const exactCity = PAKISTAN_CITIES.find(c => c.toLowerCase() === city.toLowerCase());
      city = exactCity || city;

      row.values = [
        order.customerName,
        order.address,
        city
      ];

      row.getCell(3).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`Cities!$A$1:$A$${PAKISTAN_CITIES.length}`],
        showDropDown: true,
      };
    });

    const outputPath = path.join(__dirname, 'test_export.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Test export created at: ${outputPath}`);
}

testExport().catch(console.error);
