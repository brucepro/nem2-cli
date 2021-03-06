/*
 * Copyright 2018-present NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import {command, metadata, option} from 'clime';
import {Deadline, SecretProofTransaction} from 'nem2-sdk';
import {AnnounceTransactionsCommand, AnnounceTransactionsOptions} from '../../announce.transactions.command';
import {RecipientAddressResolver} from '../../resolvers/address.resolver';
import {HashAlgorithmResolver} from '../../resolvers/hashAlgorithm.resolver';
import {MaxFeeResolver} from '../../resolvers/maxFee.resolver';
import {ProofResolver} from '../../resolvers/proof.resolver';
import {SecretResolver} from '../../resolvers/secret.resolver';
import {AddressAliasValidator} from '../../validators/address.validator';
import {HashAlgorithmValidator} from '../../validators/hashAlgorithm.validator';

export class CommandOptions extends AnnounceTransactionsOptions {

    @option({
        description: 'Proof hashed in hexadecimal. ',
        flag: 's',
    })
    secret: string;

    @option({
        description: 'Original random set of bytes in hexadecimal. ',
        flag: 'p',
    })
    proof: string;

    @option({
        description: 'Algorithm used to hash the proof (Op_Sha3_256, Op_Keccak_256, Op_Hash_160, Op_Hash_256). ',
        flag: 'H',
        validator: new HashAlgorithmValidator(),
    })
    hashAlgorithm: string;

    @option({
        description: 'Address or @alias that receives the funds once unlocked.',
        flag: 'r',
        validator: new AddressAliasValidator(),
    })
    recipientAddress: string;
}

@command({
    description: 'Announce a secret proof transaction',
})
export default class extends AnnounceTransactionsCommand {
    constructor() {
        super();
    }

    @metadata
    execute(options: CommandOptions) {
        const profile = this.getProfile(options);
        const account = profile.decrypt(options);
        const recipientAddress = new RecipientAddressResolver()
            .resolve(options, undefined, 'Enter the address or @alias that receives the funds once unlocked: ');
        const secret = new SecretResolver().resolve(options);
        const proof = new ProofResolver().resolve(options);
        const hashAlgorithm = new HashAlgorithmResolver().resolve(options);
        const maxFee = new MaxFeeResolver().resolve(options);

        const secretProofTransaction = SecretProofTransaction.create(
            Deadline.create(),
            hashAlgorithm,
            secret,
            recipientAddress,
            proof,
            profile.networkType,
            maxFee);
        const signedTransaction = account.sign(secretProofTransaction, profile.networkGenerationHash);

        this.announceTransaction(signedTransaction, profile.url);
    }
}
