(() => {
	"use strict";
	class Model {
		constructor() {
			this.url = "https://jsonplaceholder.typicode.com/posts";
			this._state = {
				inputFocused: false,
				posts: [],
				sortFlags: {
					id: {
						isActive: false,
						isASC: false
					},
					userId: {
						isActive: false,
						isASC: false
					},
					title: {
						isActive: false,
						isASC: false
					},
					body: {
						isActive: false,
						isASC: false
					}
				}
			};
		}
		async requestData() {
			return fetch(this.url).then((response => response.json(response))).then((data => this._setInitialPosts(data)));
		}
		_setInitialPosts(data) {
			this._state.posts = data.map((post => ({
				...post,
				isCorrect: true
			})));
		}
		getPosts() {
			return this._state.posts;
		}
		setSortFlag(flagName, isASC = false) {
			if (this.getSortFlags()[flagName]) {
				this._state.sortFlags[flagName] = {
					isActive: true,
					isASC
				};
				this._sortPostsBy(flagName, isASC);
			}
		}
		getSortFlags() {
			return this._state.sortFlags;
		}
		_sortPostsBy(option, isASC = false) {
			if ("id" === option || "userId" === option) this._state.posts = isASC ? [...this.getPosts().sort(((a, b) => a[option] - b[option]))] : [...this.getPosts().sort(((a, b) => b[option] - a[option]))]; else this._state.posts = isASC ? [...this.getPosts().sort(((a, b) => ("" + a[option]).localeCompare(b[option])))] : [...this.getPosts().sort(((a, b) => ("" + b[option]).localeCompare(a[option])))];
		}
		filterPosts(str) {
			if (str.length < 3) this._setInitialPosts(this.getPosts()); else this._state.posts = this.getPosts().map((post => {
				if (post.title.indexOf(str) >= 0 || post.body.indexOf(str) >= 0) return {
					...post,
					isCorrect: true
				};
				return {
					...post,
					isCorrect: false
				};
			}));
		}
	}
	class Controller {
		constructor(model, view) {
			this.model = model;
			this.view = view;
			this.model.requestData().then((() => {
				this.updateView();
			}));
		}
		filterPostsByString = str => {
			this.model.filterPosts(str);
			this.updateView();
		};
		orderPostsBy = (flag, isASC) => {
			this.model.setSortFlag(flag, isASC);
			this.updateView();
		};
		getSortFlags = () => this.model.getSortFlags();
		getPosts = () => {
			if (this.model.getPosts().length) return this.model.getPosts().filter((post => post.isCorrect)); else return null;
		};
		updateView() {
			this.view.processData({
				sortFlags: this.getSortFlags(),
				posts: this.getPosts(),
				orderPostsBy: this.orderPostsBy,
				filterPostsByString: this.filterPostsByString
			});
		}
	}
	class View {
		constructor() {
			this.postKeys = {
				id: "id",
				userId: "userId",
				title: "title",
				body: "body"
			};
			this.root = document.getElementById("root");
			this.input = document.createElement("input");
			this.root.prepend(this.input);
			this.input.className = "input";
			this.input.placeholder = "Введите строку";
			this.table = document.createElement("div");
			this.table.className = "table";
			this.id = document.createElement("div");
			this.userId = document.createElement("div");
			this.title = document.createElement("div");
			this.body = document.createElement("div");
			for (const key in this.postKeys) {
				this[key].className = `table__item ${key}`;
				this[key].innerHTML = key;
			}
			this.render();
		}
		processData({ sortFlags, posts, orderPostsBy, filterPostsByString }) {
			this.clearTrash();
			this.orderPostsBy = orderPostsBy;
			this.filterPostsByString = filterPostsByString;
			this.sortFlags = sortFlags;
			for (const key in this.postKeys) if (sortFlags[key].isActive) this[key].innerHTML = key + (sortFlags[key].isASC ? "↑" : "↓");
			this.handleEvents();
			this.render(posts);
		}
		handleEvents() {
			this.id.addEventListener("click", this.handleIdClick);
			this.userId.addEventListener("click", this.handleUserIdClick);
			this.title.addEventListener("click", this.handleTitleClick);
			this.body.addEventListener("click", this.handleBodyClick);
			this.input.addEventListener("input", this.handleInput);
		}
		clearTrash() {
			this.id.removeEventListener("click", this.handleIdClick);
			this.userId.removeEventListener("click", this.handleUserIdClick);
			this.title.removeEventListener("click", this.handleTitleClick);
			this.body.removeEventListener("click", this.handleBodyClick);
			this.input.removeEventListener("input", this.handleInput);
		}
		handleIdClick = () => {
			const ID = this.postKeys.id;
			this.orderPostsBy(ID, !this.sortFlags[ID].isASC);
		};
		handleInput = () => {
			this.filterPostsByString(this.input.value);
		};
		handleUserIdClick = () => {
			const USER_ID = this.postKeys.userId;
			this.orderPostsBy(USER_ID, !this.sortFlags[USER_ID].isASC);
		};
		handleTitleClick = () => {
			const TITLE = this.postKeys.title;
			this.orderPostsBy(TITLE, !this.sortFlags[TITLE].isASC);
		};
		handleBodyClick = () => {
			const BODY = this.postKeys.body;
			this.orderPostsBy(BODY, !this.sortFlags[BODY].isASC);
		};
		createLine(post) {
			return `\n\t\t\t<div class="table__item">${post.id}</div>\n\t\t\t<div class="table__item">${post.userId}</div>\n\t\t\t<div class="table__item">${post.title}</div>\n\t\t\t<div class="table__item">${post.body}</div>\n\t\t`;
		}
		render(posts) {
			this.root.append(this.table);
			if (this.table.innerHTML) this.table.innerHTML = "";
			if (posts) {
				for (const key in this.postKeys) this.table.append(this[key]);
				posts.forEach((post => {
					this.table.insertAdjacentHTML("beforeend", this.createLine(post));
				}));
			} else this.table.insertAdjacentHTML("beforeend", "<div>Lodaing...</div>");
		}
	}
	window.onload = function () {
		const model = new Model;
		const view = new View;
		new Controller(model, view);
	};
})();