type voters = (address, unit) big_map
type poll_id = string
type poll_option = nat
type votes = ((address * poll_id), poll_option) big_map
type totals = (poll_option, nat) map


type poll_metadata = {
    end_date : timestamp;
    num_options : nat;
}

type poll = {
    metadata : poll_metadata;
    totals : totals;
}

let empty_totals_map : (poll_option, nat) map = Map.empty

type polls = (poll_id, poll) big_map

type storage = {
    polls : polls;
    votes : votes;
    voters : voters;
    administrator : address;
}

type return = (operation list) * storage


type create_poll_arg = {
    poll_id : poll_id;
    poll_metadata : poll_metadata;
}

type vote_arg = {
    poll_id : poll_id;
    vote : poll_option;
}

type add_remove_voter_arg = address

let check_if_administrator (administrator : address) : unit =
    if Tezos.sender <> administrator then
        ( failwith "error_NOT_AN_ADMINISTRATOR" : unit )
    else
    unit

let create_poll_internal (create_poll_arg, polls : create_poll_arg * polls) : polls =
    if Big_map.mem create_poll_arg.poll_id polls then
        ( failwith "error_POLL_ALREADY_EXIST" : polls )
    else
    let poll = {metadata = create_poll_arg.poll_metadata; totals = empty_totals_map} in
    Big_map.update (create_poll_arg.poll_id) (Some (poll)) polls
    
let update_vote (vote_arg, votes : vote_arg * votes) : poll_option option * votes =
    Big_map.get_and_update ((Tezos.sender, vote_arg.poll_id)) (Some (vote_arg.vote)) votes

let get_poll (poll_id, polls : poll_id * polls) : poll =
    match ( Big_map.find_opt poll_id polls ) with
    | None -> ( failwith "error_NO_SUCH_POLL" : poll )
    | Some p -> p

let get_a_val_from_total (poll_option, totals : poll_option * totals) : nat =
    match ( Map.find_opt poll_option totals ) with
    | None -> 0n 
    | Some t -> t

let decrement_old_vote (old_vote, totals : poll_option * totals) : (poll_option, nat) map =
    let total_old_vote = get_a_val_from_total (old_vote, totals) in 
    Map.update (old_vote) (Some ( abs(total_old_vote - 1n) )) totals

let increment_new_vote (new_vote, totals : poll_option * totals) : (poll_option, nat) map =
    let total_vote = get_a_val_from_total (new_vote, totals) in
    Map.update (new_vote) (Some ( abs(total_vote + 1) )) totals

let check_voter_credentials (voters : voters) : unit =
    if Big_map.mem Tezos.sender voters then
        unit
    else
    ( failwith "error_NOT_A_VALID_VOTER" : unit )

let check_if_poll_is_over (end_date : timestamp) : unit =
    if Tezos.now > end_date then
        ( failwith "error_POLL_IS_OVER" : unit )
    else unit

let check_if_vote_option_is_valid (vote, num_options : poll_option * poll_option) : unit =
    if vote > num_options then
        ( failwith "error_VOTE_OPTION_INVALID" : unit )
    else unit

let add_voter_internal (new_voter, voters : address * voters) : voters =
    Big_map.update (new_voter) (Some (unit)) voters

let remove_voter_internal (voter_to_remove, voters : address * voters) : voters =
    Big_map.remove voter_to_remove voters

let create_poll ( create_poll_arg, storage : create_poll_arg * storage ) : return =
    let _ = check_if_administrator storage.administrator in
    let polls = create_poll_internal (create_poll_arg, storage.polls) in
    let storage = {storage with polls = polls} in
    (([] : operation list), storage)

let vote ( vote_arg, storage : vote_arg * storage ) : return =
    let _ = check_voter_credentials storage.voters in
    let poll = get_poll (vote_arg.poll_id, storage.polls) in
    let metadata = poll.metadata in
    let _ = check_if_poll_is_over metadata.end_date in
    let _ = check_if_vote_option_is_valid (vote_arg.vote, metadata.num_options) in
    let old_vote_id, votes = update_vote (vote_arg, storage.votes) in
    let new_totals = match old_vote_id with
        | Some v -> (
            decrement_old_vote (v, poll.totals)
        )
        | None -> poll.totals in
    let new_totals = increment_new_vote (vote_arg.vote, new_totals) in 
    let poll = {poll with totals = new_totals} in
    let polls = Big_map.update (vote_arg.poll_id) (Some (poll)) storage.polls in
    let storage = {storage with 
        polls = polls;
        votes = votes
        } in
        (([] : operation list), storage)   

let add_voter ( add_remove_voter_arg, storage : add_remove_voter_arg * storage ) : return =
    let _ = check_if_administrator storage.administrator in
    let voters = add_voter_internal (add_remove_voter_arg, storage.voters) in
    let storage = {storage with voters = voters} in

    (([] : operation list), storage) 

let remove_voter ( add_remove_voter_arg, storage : add_remove_voter_arg * storage ) : return =
    let _ = check_if_administrator storage.administrator in
    let voters = remove_voter_internal (add_remove_voter_arg, storage.voters) in
    let storage = {storage with voters = voters} in

    (([] : operation list), storage) 

 type parameter =
    | CreatePoll of create_poll_arg
    | Vote of vote_arg
    | AddVoter of add_remove_voter_arg
    | RemoveVoter of add_remove_voter_arg    

let main (action, s : parameter * storage) : return = 
    (match action with
    | CreatePoll (create_poll_arg) -> create_poll (create_poll_arg, s)
    | Vote (vote_arg) -> vote (vote_arg, s)
    | AddVoter (add_remove_voter_arg) -> add_voter (add_remove_voter_arg, s)
    | RemoveVoter (add_remove_voter_arg) -> remove_voter (add_remove_voter_arg, s)
    )

let init_storage : storage = {
    polls = ( Big_map.empty : polls );
    votes = ( Big_map.empty : votes );
    voters = ( Big_map.empty : voters );
    administrator = Tezos.sender;
}