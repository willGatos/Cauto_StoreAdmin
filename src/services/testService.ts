const { createClient } = require('@supabase/supabase-js');

// Initialize the Supabase client
const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to get supply data
async function getSupply() {
    const { data, error } = await supabase
        .from('supply') // Replace 'supply' with your table name
        .select('*'); // Adjust the select query as needed

    if (error) {
        console.error('Error fetching supply data:', error);
        return null;
    }

    return data;
    
}

module.exports = { getSupply };
