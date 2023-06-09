import { Effect, Reducer, Subscription } from 'umi';
import { getRemoteList, editRecord, deleteRecord } from './service';
import { message } from 'antd';
import { SingleUserType } from './data.d';

export interface UserState {
  data: SingleUserType[];
  meta: {
    total: number;
    per_page: number;
    page: number;
  };
}

export interface UserModelType {
  namespace: 'users';
  state: UserState;
  effects: {
    getRemote: Effect;
    edit: Effect;
    delete: Effect;
  };
  reducers: {
    getList: Reducer<UserState>;
    // 启用 immer 之后
    // save: ImmerReducer<IndexModelState>;
  };
  subscriptions: { setup: Subscription };
}

const IndexModel: UserModelType = {
  namespace: 'users',

  state: {
    data: [],
    meta: {
      total: 1,
      per_page: 10,
      page: 1,
    }
  },

  effects: {
    *getRemote({ payload: { page, per_page } }, { put, call }):any {
      const data = yield call(getRemoteList, { page, per_page });
      if (data) {
        yield put({
          type: 'getList',
          payload: data,
        });
      }
    },
    *edit({ type, payload: { id, values } }, { put, call }):any {
      const data = yield call(editRecord, { id, values });
    },
    *delete({ payload: { id } }, { put, call, select }) :any {
      const data = yield call(deleteRecord, { id });
      if (data) {
        message.success('Delete successfully.');
        const { page, per_page } = yield select((state: any) => state.users.meta);
        yield put({
          type: 'getRemote',
          payload: {
            page,
            per_page,
          },
        });
      } else {
        message.error('Delete failed.');
      }
    },
  },
  reducers: {
    getList(state, { type, payload }) {
      // getList(state, action) {
      return payload;
    },
    // 启用 immer 之后
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/organization/tenantryDva') {
          dispatch({
            type: 'getRemote',
            payload: {
              page: 1,
              per_page: 10,
            },
          });
        }
      });
    },
  },
};

export default IndexModel;
