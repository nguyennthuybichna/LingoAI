let idCounter = 1;
const nextId = () => `mock_id_${idCounter++}_${Math.random().toString(36).substr(2, 9)}`;

const store = {
  User: [],
  Glossary: [],
  Translation: []
};

const seedGlossary = (userId) => {
  if (store.Glossary.length === 0) {
    store.Glossary.push(
      {
        _id: nextId(),
        userId,
        sourceTerm: 'Floating Button',
        targetTerm: 'Nút lơ lửng',
        domain: 'General',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: nextId(),
        userId,
        sourceTerm: 'Onboarding',
        targetTerm: 'Hướng dẫn bắt đầu',
        domain: 'General',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: nextId(),
        userId,
        sourceTerm: 'Sweet Treats',
        targetTerm: 'Đồ ngọt',
        domain: 'General',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        _id: nextId(),
        userId,
        sourceTerm: 'Kawaii Aesthetic',
        targetTerm: 'Phong cách Kawaii',
        domain: 'General',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    );
  }
};

class MockQuery {
  constructor(data) {
    this.data = data;
  }
  sort(sortObj) {
    if (sortObj && sortObj.createdAt === -1) {
      this.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return this;
  }
  then(resolve, reject) {
    return Promise.resolve(this.data).then(resolve, reject);
  }
}

class MockModel {
  constructor(modelName) {
    this.modelName = modelName;
  }

  _wrapDocument(item) {
    const modelName = this.modelName;
    return {
      ...item,
      async save() {
        const list = store[modelName];
        const idx = list.findIndex(x => x._id === this._id);
        if (idx !== -1) {
          const updated = { ...this };
          delete updated.save;
          updated.updatedAt = new Date().toISOString();
          list[idx] = updated;
        }
        return this;
      }
    };
  }

  _matches(item, query) {
    for (let key in query) {
      if (key === '$or') {
        const subqueries = query[key];
        const anyMatch = subqueries.some(sub => this._matches(item, sub));
        if (!anyMatch) return false;
      } else {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
    }
    return true;
  }

  async find(query = {}) {
    let results = store[this.modelName] || [];
    results = results.filter(item => this._matches(item, query));
    const cloned = results.map(r => this._wrapDocument(r));
    return new MockQuery(cloned);
  }

  async findOne(query = {}) {
    let results = store[this.modelName] || [];
    const item = results.find(item => this._matches(item, query));
    return item ? this._wrapDocument(item) : null;
  }

  async findById(id) {
    let results = store[this.modelName] || [];
    const item = results.find(item => item._id === id);
    return item ? this._wrapDocument(item) : null;
  }

  async create(data) {
    const newItem = {
      _id: nextId(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (this.modelName === 'User') {
      seedGlossary(newItem._id);
    }
    store[this.modelName].push(newItem);
    return this._wrapDocument(newItem);
  }

  async findByIdAndDelete(id) {
    const list = store[this.modelName] || [];
    const index = list.findIndex(item => item._id === id);
    if (index !== -1) {
      const removed = list.splice(index, 1)[0];
      return removed;
    }
    return null;
  }

  async findOneAndDelete(query = {}) {
    const list = store[this.modelName] || [];
    const index = list.findIndex(item => this._matches(item, query));
    if (index !== -1) {
      const removed = list.splice(index, 1)[0];
      return removed;
    }
    return null;
  }

  async findOneAndUpdate(query = {}, update = {}, options = {}) {
    const list = store[this.modelName] || [];
    const index = list.findIndex(item => this._matches(item, query));
    if (index !== -1) {
      const item = list[index];
      for (let key in update) {
        if (update[key] !== undefined) {
          item[key] = update[key];
        }
      }
      item.updatedAt = new Date().toISOString();
      return this._wrapDocument(item);
    }
    return null;
  }
}

function getModel(modelName, realModel) {
  return new Proxy({}, {
    get(target, prop) {
      if (global.useMockDb) {
        const mock = new MockModel(modelName);
        return mock[prop] ? mock[prop].bind(mock) : undefined;
      }
      return realModel[prop] ? realModel[prop].bind(realModel) : undefined;
    }
  });
}

module.exports = { getModel };


