// Test script to verify Dashboard 05 is working
console.log('Testing Dashboard 05...');

fetch('http://localhost:5178/sample/dashboards/05')
  .then(response => response.text())
  .then(html => {
    // Check if page loads without errors
    if (html.includes('人事労務管理')) {
      console.log('✓ Dashboard title found');
    }
    
    // Check for common error patterns
    if (html.includes('is not defined') || html.includes('ReferenceError')) {
      console.error('✗ JavaScript error found in page');
    } else {
      console.log('✓ No obvious JavaScript errors');
    }
    
    // Check if tabs are present
    if (html.includes('勤怠') && html.includes('従業員') && html.includes('採用')) {
      console.log('✓ All tabs present');
    }
    
    console.log('\nTest complete!');
  })
  .catch(err => console.error('Failed to fetch page:', err));