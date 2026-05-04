import { create } from 'zustand'

const useAccountStore = create((set) => ({
  accounts: [],
  totalBalance: 0,
  setAccounts: (accounts) => set({ accounts }),
  setTotalBalance: (totalBalance) => set({ totalBalance }),
  addAccount: (account) =>
    set((state) => ({ accounts: [...state.accounts, account] })),
  updateAccount: (updated) =>
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === updated.id ? updated : a
      ),
    })),
  removeAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id),
    })),
}))

export default useAccountStore