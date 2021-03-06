/**
 * State auth
 */
import AuthService from "../../services/AuthService";
const state = {
    token: localStorage.getItem('token') || '',
    user: {},
    status: null,
};

const getters = {
    isLoggedIn: state => !!state.token,
    authStatus(state) {
        return state.status;
    },
    getUser(state) {
        return state.user;
    }
};

const mutations = {
    auth_request(state) {
        state.status = 'loading';
    },
    auth_success(state, obj) {
        state.status = 'success';
        state.token = obj.token;
        //console.log(user);
        state.user = obj.user;
    },
    auth_error(state) {
        state.status = 'error';
    },
    logout(state) {
        state.status = '';
        state.token = ''
    },
};

const actions = {
    login({ commit }, user) {
        commit('auth_request');
        return new Promise((resolve, reject) => {
            AuthService.login(user).then(resp => {
                    const token = resp.data.token;
                    localStorage.setItem('token', token);

                    // jwt decoding
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    const buff = new Buffer(base64, 'base64');
                    const payloadinit = buff.toString('ascii');
                    const user = JSON.parse(payloadinit);


                    let obj = {token, user};
                    commit('auth_success', obj);
                    resolve(resp)
                })
                .catch(err => {
                    commit('auth_error');
                    localStorage.removeItem('token');
                    reject(err)
                })
        })
    },
    logout({ commit }) {
        return new Promise((resolve) => {
            commit('logout');
            localStorage.removeItem('token');
            //delete this.axios.defaults.headers.common['Authorization'];
            resolve()
        })
    }
};

export default {
    state,
    actions,
    mutations,
    getters
};
