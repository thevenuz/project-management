import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LogoutButton from '../login/Logout';

const Ticket = () => {
    const [ticket, setTicket] = useState({});
    const [newComment, setNewComment] = useState(""); 
    const [editingCommentId, setEditingCommentId] = useState(null); 
    const [editingCommentText, setEditingCommentText] = useState(""); 
    const [editingAssignee, setEditingAssignee] = useState(false); 
    const [newAssignee, setNewAssignee] = useState(""); 
    const [userRole, setUserRole] = useState(""); 

    const { pid, tskid, tid } = useParams();
    const navigate = useNavigate();

    const getTicket = () => {
        fetch(`http://localhost:5000/prm/tickets/${tid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Error fetching task details");
                }
                return response.json();
            })
            .then((data) => {
                setTicket(data.data);
            })
            .catch((error) => console.error('Fetch error:', error));
    }

    useEffect(() => {
        getTicket();

        
        const role = localStorage.getItem('role');
        if (role) {
            setUserRole(role);
        }
    }, []);

    const handleDeleteTicket = () => {
        fetch(`http://localhost:5000/prm/tickets/${tid}`, {
            method: 'DELETE',
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error deleting ticket');
            }
            console.log('Ticket deleted successfully');
            navigate('/projects');
        })
        .catch((error) => console.error('Delete error:', error));
    };

    const handleDeleteComment = (commentId) => {
        fetch(`http://localhost:5000/prm/tickets/${tid}/comments/${commentId}`, {
            method: 'DELETE',
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error deleting comment');
            }
            console.log('Comment deleted successfully');
            getTicket();
        })
        .catch((error) => console.error('Delete comment error:', error));
    };

    const handleAddComment = () => {
        
        if (ticket.ticket_status === 'closed') {
            alert('Cannot add comment to a closed ticket.');
            return;
        }

        const user = localStorage.getItem('username');
        const commentData = {
            comment_description: newComment,
            created_by: user
        };

        fetch(`http://localhost:5000/prm/tickets/${tid}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(commentData),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error adding comment');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Comment added:', data);
            setNewComment("");
            getTicket();
        })
        .catch((error) => console.error('Add comment error:', error));
    };

    const handleEditComment = (commentId, commentText) => {
        setEditingCommentId(commentId);
        setEditingCommentText(commentText);
    };

    const handleUpdateComment = (commentId) => {
        const updatedCommentData = {
            comment_description: editingCommentText,
        };

        fetch(`http://localhost:5000/prm/tickets/${tid}/comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedCommentData),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error updating comment');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Comment updated:', data);
            setEditingCommentId(null);
            setEditingCommentText("");
            getTicket();
        })
        .catch((error) => console.error('Update comment error:', error));
    };

    const handleEditAssignee = () => {
        setEditingAssignee(true);
        setNewAssignee(ticket.assigned_user);
    };

    const handleUpdateAssignee = () => {
        
        if (ticket.ticket_status === 'closed') {
            alert('Cannot update assignee for a closed ticket.');
            return;
        }

        ticket.assigned_user = newAssignee;
        fetch(`http://localhost:5000/prm/tasks/${tskid}/tickets/${tid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticket),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error updating assignee');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Assignee updated:', data);
            setEditingAssignee(false);
            getTicket();
        })
        .catch((error) => console.error('Update assignee error:', error));
    };

    const handleCloseTicket = () => {
        
        if (userRole !== 'manager' && userRole !== 'admin') {
            alert('Only managers or admins are allowed to close tickets.');
            return;
        }

        ticket.ticket_status = 'closed';
        fetch(`http://localhost:5000/prm/tasks/${tskid}/tickets/${tid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ticket),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error closing ticket');
            }
            return response.json();
        })
        .then((data) => {
            console.log('Ticket closed:', data);
            getTicket();
        })
        .catch((error) => console.error('Close ticket error:', error));
    };

    const renderTicketDetails = () => (
        <div>
            <div className="mb-6 text-center">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => {
                        navigate(`/projects/${pid}/tasks/${tskid}/tickets/${tid}/edit`);
                    }}
                    type="button"
                >
                    Edit Ticket
                </button>
                <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4 focus:outline-none focus:shadow-outline"
                    onClick={handleDeleteTicket}
                    type="button"
                >
                    Delete Ticket
                </button>
                {userRole === 'manager' || userRole === 'admin' ? (
                    <button
                        className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4 focus:outline-none focus:shadow-outline ${ticket.ticket_status === 'closed' ? ' bg-gray-500 hover:bg-gray-700 cursor-not-allowed' : ''}`}
                        onClick={handleCloseTicket}
                        type="button"
                        disabled={ticket.ticket_status === 'closed'}
                    >
                        Close Ticket
                    </button>
                ) : (
                    <button
                        className="bg-gray-500 text-white font-bold py-2 px-4 rounded ml-4 cursor-not-allowed"
                        disabled
                        type="button"
                    >
                        Close Ticket
                    </button>
                )}
            </div>
            <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">
                    <h2 className="text-3xl font-bold">{ticket.ticket_id}: {ticket.ticket_title}</h2>
                </div>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border p-4 rounded-md">
                        <p className="font-medium">Created by: {ticket.created_by}</p>
                    </div>
                    <div className="border p-4 rounded-md">
                        <p className="font-medium">Status: {ticket.ticket_status}</p>
                    </div>
                    <div className="border p-4 rounded-md">
                        <p className="font-medium">Created on: {ticket.created_date}</p>
                    </div>
                    <div className="border p-4 rounded-md">
                        <p className="font-medium">Last updated on: {ticket.last_updated_date}</p>
                    </div>
                    {ticket.closed_date !== "null" && (
                        <div className="border p-4 rounded-md">
                            <p className="font-medium">Closed on: {ticket.closed_date}</p>
                        </div>
                    )}
                    <div className="border p-4 rounded-md">
                        <p className="font-medium">Assigned to: {ticket.assigned_user}</p>
                        {editingAssignee ? (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={newAssignee}
                                    onChange={(e) => setNewAssignee(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                <button
                                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2 focus:outline-none focus:shadow-outline ${ticket.ticket_status === 'closed' ? ' bg-gray-500 hover:bg-gray-700 cursor-not-allowed' : ''}`}
                                    onClick={handleUpdateAssignee}
                                    type="button"
                                >
                                    Update Assignee
                                </button>
                            </div>
                        ) : (
                            <button
                                className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mt-2 focus:outline-none focus:shadow-outline ${ticket.ticket_status === 'closed' ? ' bg-gray-500 hover:bg-gray-700 cursor-not-allowed' : ''}`}
                                onClick={handleEditAssignee}
                                type="button"
                                disabled={ticket.ticket_status === 'closed'}
                            >
                                Change Assignee
                            </button>
                        )}
                    </div>
                </div>
                <div className="mb-6">
                    <h3 className="font-semibold text-lg">Description:</h3>
                    <p className="mt-2">{ticket.ticket_description}</p>
                </div>
                <div className="mb-6">
                    <h3 className="font-bold text-lg">Comments:</h3>
                    {ticket.comments.map((comment, index) => (
                        <div key={index} className="border rounded-md p-4 mb-2 relative">
                            <p className="font-semibold">Created by: {comment.created_by}</p>
                            <p>{comment.comment_description}</p>
                            {editingCommentId === comment.comment_id ? (
                                <div>
                                    <textarea
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                    <button
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mt-2 focus:outline-none focus:shadow-outline"
                                        onClick={() => handleUpdateComment(comment.comment_id)}
                                        type="button"
                                    >
                                        Update Comment
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-end space-x-2 mt-2">
                                    {comment.created_by === localStorage.getItem('username') && (
                                        <button
                                            className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ${ticket.ticket_status === 'closed' ? ' bg-gray-500 hover:bg-gray-700 cursor-not-allowed' : ''}`}
                                            onClick={() => handleEditComment(comment.comment_id, comment.comment_description)}
                                            type="button"
                                            disabled={ticket.ticket_status === 'closed'}
                                        >
                                            Edit Comment
                                        </button>
                                    )}
                                    {comment.created_by === localStorage.getItem('username') && (
                                        <button
                                            className={`bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline ${ticket.ticket_status === 'closed' ? ' bg-gray-500 hover:bg-gray-700 cursor-not-allowed' : ''}`}
                                            onClick={() => handleDeleteComment(comment.comment_id)}
                                            type="button"
                                            disabled={ticket.ticket_status === 'closed'}
                                        >
                                            Delete Comment
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="new_comment">
                        Add Comment:
                    </label>
                    <textarea
                        id="new_comment"
                        name="new_comment"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
                <div className="mb-6">
                    <button
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${ticket.ticket_status === 'closed' ? ' bg-gray-500 hover:bg-gray-700 cursor-not-allowed' : ''}`}
                        onClick={handleAddComment}
                        type="button"
                        disabled={ticket.ticket_status === 'closed'}
                    >
                        Add Comment
                    </button>
                </div>
            </div>
            <LogoutButton/>
        </div>
    );

    return (
        <div className="container mx-auto p-4">
            {Object.keys(ticket).length === 0 ? (
                <div className="text-center text-lg">Loading...</div>
            ) : (
                renderTicketDetails()
            )}
        </div>
    );
}

export default Ticket;
