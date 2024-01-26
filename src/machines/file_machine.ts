import { createMachine } from 'xstate';

const file_machine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgDMBLAGzHxAActYiAXIrDCgD0QFoA2dATw8+RoQxMgDoiGekQCGJAMp1pdckio0pTVogAsAJl6IAHAEZRxk4YCs285YDsnAJwAGS4MFA */
    id: 'file',
    initial: 'initialState',
    states: {
        initialState: {},
    }
});

export default file_machine;