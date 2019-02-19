const app = (function() {
	/*
    {
        uniqueID: {
            post:"this is a post", 
            username: "sandeep", 
            comments: {
                uniqueID: {
                    post: "this is a comment", 
                    username: "sandeep", 
                    comments: {
                        uniqueID: {
                            post: "this is a comment",
                            username: "sandeep 2"
                        }
                    }
                }
            }
        }
    }

    v2
    {
        uniqueID: {
            post:"this is a post", 
            username: "sandeep"
        },
        uniqueID2: {
            post: "this is a comment", 
            username: "sandeep", 
            parent: uniqueID1
        }, 
        uniqueID3: {
            post: "this is a reply",
            username: "sandeep 2",
            parent: uniqueID2
        }
    }

    v3, array for posts so if we decide to show only last x number of posts, its easier to trim this small array. For eg: we only show last 10 posts, just taking last 10 items will be easy to implement
    comments object with key to parent post. whenever a nesting happens, a new key added with the parentId as key, so no need to loop 
    Looping though the entire data is only done when rendering the posts. This can be optimized by keeping a track of the div that is being injected to dom (the same logic react uses)
    While adding replies or posts, we are not looping through the data.

    posts = [
        {id:parentId, post, username}
    ]

    comments = {
        parentId: [{
            id: parentId2,
            post,
            username
        ],
        parentId2: [{
            id: parentId3,
            post,
            username
        }]
    }

    */
	const posts = [
		{ id: 1550571977457, username: 'test user', post: 'This is a post' },
		{ id: 1550571990417, username: 'test user', post: 'this is another post' }
	];
	const comments = {
		'1550571977457': [
			{ id: 1550572000297, username: 'test user', post: 'this is a reply L1' },
			{ id: 1550572042429, username: 'test user', post: 'This is another reply L1' }
		],
		'1550572000297': [{ id: 1550572008527, username: 'test user', post: 'this is a reply L2' }],
		'1550572008527': [{ id: 1550572017481, username: 'test user', post: 'This is a reply L3' }],
		'1550572017481': [{ id: 1550572024621, username: 'test user', post: 'This is a reply L4' }],
		'1550571990417': [{ id: 1550572062064, username: 'test user', post: 'This is a reply L11' }],
		'1550572024621': [{ id: 1550572089557, username: 'test user', post: 'This is a reply L5' }],
		'1550572089557': [{ id: 1550572117147, username: 'test user', post: 'this is a reply L6' }]
	};

	const config = {
		replyBtnClass: 'reply-btn',
		replyFormClass: 'reply-form'
	};

	/* generate a unique ID, TODO: use some libraries */
	function getUniqueId() {
		const date = new Date();
		return date.getTime();
	}

	/* 
        add a new post to the object 
        if parent is not present, this is a post
    
    */
	function addPost(e) {
		e.preventDefault();
		const target = e.target;
		const username = target.username.value;
		const post = target.post.value;

		//clear the field values
		target.username.value = '';
		target.post.value = '';

		const parent = target.getAttribute('data-parent');
		const id = getUniqueId();

		if (parent) {
			if (comments[parent]) {
				comments[parent].push({
					id,
					username,
					post
				});
			} else {
				comments[parent] = [{ id, username, post }];
			}
		} else {
			posts.push({
				id,
				username,
				post
			});
		}
		renderPosts();
	}

	/* loop through posts and display all posts */
	function renderPosts() {
		config.postsSelector.innerHTML = getParentPosts();
	}

	function getParentPosts() {
		return posts
			.map(
				post => `
                <div class="post">
                    <section class="avatar-wrapper">
                        <img src="images/user.jpg" alt="avatar" />
                    </section>
                    <section class="post-content">
                        <p class="username">${post.username}</p>
                        <p class="comment">${post.post}</p>
                        ${renderActionsBlock(post.id)}
                        ${renderComments(post.id)}
                    </section>
                </div>
            `
			)
			.join('');
	}

	function renderActionsBlock(parent) {
		return `
        <div class="actions">
            <a href="#" class="link ${config.replyBtnClass}" data-parent="${parent}">Reply</a>
            <div class="reply-form-wrapper"></div>
        </div>
        `;
	}

	function renderComments(parent) {
		if (comments[parent]) {
			return comments[parent].map(comment => renderComment(comment)).join('');
		}
		return '';
	}

	function renderComment(comment) {
		return `<div class="comments">
        <div class="post">
            <section class="avatar-wrapper">
                <img src="images/user.jpg" alt="avatar" />
            </section>
            <section class="post-content">
                <p class="username">${comment.username}</p>
                <p class="comment">${comment.post}</p>
                ${renderActionsBlock(comment.id)}
                ${comments[comment.id] ? renderComments(comment.id) : ''}
            </section>
        </div>`;
	}

	function getReplyForm(parent) {
		return `
        <form class="form ${config.replyFormClass}" data-parent="${parent}">
            <div class="field-wrapper">
                <input name="post" type="text" placeholder="comment" required />
            </div>           
            <div class="field-wrapper">
                <input name="username" type="text" placeholder="username" required value="test user" />
                <input class="btn" type="submit" value="Comment" />
            </div>
        </form>`;
	}

	function attachEvents() {
		document.addEventListener('click', e => {
			var clickedItem = e.target;
			if (clickedItem.className.split(' ').includes(config.replyBtnClass)) {
				e.preventDefault();
				const parent = clickedItem.getAttribute('data-parent');
				clickedItem.nextElementSibling.innerHTML = getReplyForm(parent);
			}
		});

		document.addEventListener('submit', e => {
			var submittedForm = e.target;
			if (submittedForm.className.split(' ').includes(config.replyFormClass)) {
				addPost(e);
			}
		});
	}

	return {
		init(formSelector, postsSelector) {
			formSelector.addEventListener('submit', addPost);
			config.postsSelector = postsSelector;
			attachEvents();
			renderPosts(); // if we want to load initial posts
		}
	};
})();

document.addEventListener('DOMContentLoaded', function() {
	const formSelector = document.querySelector('#post-form');
	const postsSelector = document.querySelector('#posts');
	app.init(formSelector, postsSelector);
});
