    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', async (event) => {
                const blogId = button.getAttribute('data-id');
                
                if (confirm('Are you sure you want to delete this blog?')) {
                    try {
                        const response = await fetch(`/api/blogs/${blogId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                // 如果需要Token身份验证，取消注释下一行
                                // 'Authorization': `Bearer ${yourToken}`
                            }
                        });

                        const result = await response.json();

                        if (response.ok) {
                            // alert('Blog deleted successfully!');
                            location.reload(); // 刷新页面
                        } else {
                            alert(`Error: ${result.message}`);
                        }
                    } catch (error) {
                        console.error('Error deleting blog:', error);
                        alert('An unexpected error occurred.');
                    }
                }
            });
        });
    });

    async function submitForm(event) {
        event.preventDefault();
      
        const blog = JSON.parse(document.getElementById('blogData').textContent);
        const method = blog._id ? 'PUT' : 'POST';
        const endpoint = '/api/blogs';
      
        const formData = {
          title: document.getElementById('title').value,
          content: document.getElementById('content').value,
          author: document.getElementById('author').value
        };
      
        try {
          const response = await fetch(endpoint, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
      
          if (response.ok) {
            window.location.href = '/blogs';
          } else {
            const errorData = await response.json();
            alert(errorData.message || 'Something went wrong');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to submit the form');
        }
      }