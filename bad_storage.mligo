type poll_id = string

type poll_metadata = {
    end_date : timestamp;
    num_options : nat;
}

type votes = ( address, nat ) map

type totals = ( nat, nat ) map

type poll = {
    metadata : poll_metadata;
	votes : votes;
    totals : totals;
}

type polls = ( poll_id, poll ) map

type voters = ( address, unit ) map

type storage = {
    polls : polls;
    voters : voters;
    administrator : address;
}
