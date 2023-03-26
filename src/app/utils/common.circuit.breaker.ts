import { Policy, ConsecutiveBreaker, TimeoutStrategy } from 'cockatiel';

export default class CommonCircuitBreaker {
    constructor(policyArray) {
        this['policies'] = this.createPolicyObject(policyArray || []);
        this['defaultPauseTime'] = 10000;
        this['defaultConsecutiveBreaker'] = 3;
        this['defaultTimeout'] = 4000;
        this['defaultAttempts'] = 3;
        this['defaultDelay'] = 3000;
    }

    createPolicyObject(policyArray) {
        console.log('policyArray', policyArray);
        let policies = [];
        try {
            for (let policy of policyArray) {
                if (policy && policy.hasOwnProperty('name')) {
                    if (policy.name.toLowerCase() == 'circuitbreaker') {
                        if (
                            policy.hasOwnProperty('pauseTime') &&
                            policy.hasOwnProperty('consecutiveBreaker')
                        ) {
                            policies.push(
                                Policy.handleAll().circuitBreaker(
                                    policy.pauseTime,
                                    new ConsecutiveBreaker(
                                        policy.ConsecutiveBreaker
                                    )
                                )
                            );
                        } else {
                            throw new Error(
                                'Circuit Breaker have Invalid Fields'
                            );
                        }
                    }

                    if (policy && policy.name.toLowerCase() == 'timeout') {
                        if (policy.hasOwnProperty('timeout')) {
                            policies.push(
                                Policy.timeout(
                                    policy.timeout,
                                    TimeoutStrategy.Aggressive
                                )
                            );
                        } else {
                            throw new Error('Timeout have Invalid Fields');
                        }
                    }

                    if (policy && policy.name.toLowerCase() == 'retry') {
                        if (
                            policy.hasOwnProperty('attempts') &&
                            policy.hasOwnProperty('delay') ^
                                policy.hasOwnProperty('exponential')
                        ) {
                            if (policy.hasOwnProperty('delay')) {
                                policies.push(
                                    Policy.handleAll()
                                        .retry()
                                        .attempts(policy.attempts)
                                        .delay(policy.delay)
                                );
                            } else if (policy.hasOwnProperty('exponential')) {
                                policies.push(
                                    Policy.handleAll()
                                        .retry()
                                        .attempts(policy.attempts)
                                        .exponential()
                                );
                            }
                        } else {
                            throw new Error('Retry have Invalid Fields');
                        }
                    }
                }
            }
            return policies;
        } catch (error) {
            console.log('Error in createPolicyObject:- ', error);
        }
    }

    getCircuitBreaker() {
        if (!this['policies'].length) {
            return Policy.wrap(
                Policy.timeout(
                    this['defaultTimeout'],
                    TimeoutStrategy.Aggressive
                ),
                Policy.handleAll()
                    .retry()
                    .attempts(this['defaultAttempts'])
                    .delay(this['defaultDelay']),
                Policy.handleAll().circuitBreaker(
                    this['defaultPauseTime'],
                    new ConsecutiveBreaker(this['defaultConsecutiveBreaker'])
                )
            );
        }
        // FOR TESTING:-
        // this.policies[this.policies.length-1].onBreak(()=>{console.log("On Break")});
        this['policies'][0].onTimeout(() => {
            console.log('Timeout');
        });

        this['policies'][1].onRetry(() => {
            console.log('Retry');
        });
        return Policy.wrap.apply(null, this['policies']);
    }
}
