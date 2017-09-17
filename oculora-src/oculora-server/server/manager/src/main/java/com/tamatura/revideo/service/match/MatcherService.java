/*
 * Copyright 2015 Tamaturra Inc.
 */
package com.tamatura.revideo.service.match;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import com.tamatura.revideo.data.model.RelatedModel;
import com.tamatura.revideo.data.model.Room;
import com.tamatura.revideo.data.model.User;
import com.tamatura.revideo.data.model.Room.StreamType;
import com.tamatura.revideo.service.sort.SortSearchMode;

/**
 * @author Shreesh
 *
 */
public class MatcherService {
	
	private static final int MATCH_PAGE_SIZE = 1000;
	@Autowired
	@Qualifier("taskExecutorMatcherPool")
	protected TaskExecutor taskExecutor;
	
	@Autowired
    @Qualifier("mongoTemplateUSER")
	MongoOperations mongoOperationsUSER;
	
	@Autowired
    @Qualifier("mongoTemplateP2P")
	MongoOperations mongoOperationsP2P;
	
	private class MatchTask implements Runnable {
		/*EMatchType matchType;
		IMatchRoot matchSrc;
		Boolean changed;*/
		
		MatchArgs arg;
		
		public MatchTask(MatchArgs arg) {
			/*matchType = mt;
			matchSrc = obj;
			changed = ch;*/
			this.arg = arg;
		}
		
		@Override
		public void run() {
			// TODO Auto-generated method stub
			switch(arg.matchType) {
			case MatchType_User_KWS:
				runMatcherUserKWS();
				break;
			case MatchType_Room_KWS:
				runMatcherRoom();
				break;
			case MatchType_User_FW:
				runMatcherUserFW();
				break;
			/*case MatchType_User_OneWayFW:
				runMatcherUserOneWayFW();
				break;*/
			case MatchType_Room_FW:
				runMatcherRoomFW();
				break;
			default:
				break;
			}
		}
		
		private void runMatcherUserKWS() {
			MatchRootArgs argImpl = (MatchRootArgs) arg;
			if(argImpl.changed != false) {
				User usero = (User) argImpl.matchSrc;
				Set<SortSearchMode> srch = new HashSet<SortSearchMode>();
				srch.add(SortSearchMode.SortPairMode_ANY);
				srch.add(SortSearchMode.SortPairMode_MATCHING);
				Query q = query(where("keywords").in(usero.keywords).andOperator(where("searchMode").in(srch)).andOperator(where("enabled").is(true)).andOperator(where("userId").ne(usero.id)));
				mongoOperationsP2P.updateMulti(q, new Update().pull("refRoomsKWs", usero.id), Room.class);
			}
			User usero = (User) argImpl.matchSrc;
			Set<SortSearchMode> srch = new HashSet<SortSearchMode>();
			srch.add(SortSearchMode.SortPairMode_ANY);
			srch.add(SortSearchMode.SortPairMode_MATCHING);
			Query q = query(where("keywords").in(usero.keywords).andOperator(where("searchMode").in(srch).andOperator(where("enabled").is(true).andOperator(where("userId").ne(usero.id)))));
			List<Room> ul = mongoOperationsP2P.find(q, Room.class);
			mongoOperationsP2P.updateMulti(q, new Update().addToSet("refRoomsKWs", usero.id), Room.class);
			
		}
		
		/*private void runMatcherUserOneWayFW() {
			MatchFWArgs argImpl = (MatchFWArgs) arg;
			if(argImpl.changed != false) {
				User usero = (User) matchSrc;
				Set<SortSearchMode> srch = new HashSet<SortSearchMode>();
				srch.add(SortSearchMode.SortPairMode_ANY);
				srch.add(SortSearchMode.SortPairMode_MATCHING);
				Query q = query(where("keywords").in(usero.keywords).andOperator(where("searchMode").in(srch)).andOperator(where("enabled").is(true)).andOperator(where("userId").ne(usero.id)));
				mongoOperationsP2P.updateMulti(q, new Update().pull("refRoomsKWs", usero.id), Room.class);
			}
			User usero = (User) matchSrc;
			Set<SortSearchMode> srch = new HashSet<SortSearchMode>();
			srch.add(SortSearchMode.SortPairMode_ANY);
			srch.add(SortSearchMode.SortPairMode_MATCHING);
			Query q = query(where("keywords").in(usero.keywords).andOperator(where("searchMode").in(srch)).andOperator(where("enabled").is(true)).andOperator(where("userId").ne(usero.id)));
			mongoOperationsP2P.updateMulti(q, new Update().addToSet("refRoomsKWs", usero.id), Room.class);
			
		}*/
		
		private void runMatcherUserFW() {
			MatchFWArgs argImpl = (MatchFWArgs) arg;
			if(argImpl.changed != false) {
				
				Query q = query(where("userId").is(argImpl.targetId).andOperator(where("enabled").is(true).andOperator(where("searchMode").ne(SortSearchMode.SortPairMode_THISUSERS))));
				mongoOperationsP2P.updateMulti(q, new Update().pull("refUsersFW", argImpl.sourceId), Room.class);
			}
			
			Query q = query(where("userId").is(argImpl.targetId).andOperator(where("enabled").is(true).andOperator(where("searchMode").ne(SortSearchMode.SortPairMode_THISUSERS))));
			mongoOperationsP2P.updateMulti(q, new Update().addToSet("refUsersFW", argImpl.sourceId), Room.class);
			
		}
		private void runMatcherRoom() {
			MatchRootArgs argImpl = (MatchRootArgs) arg;
			if(argImpl.changed != false) {
				
				Room room = (Room) argImpl.matchSrc;
				
				Query q = query(where("keywords").in(room.keywords));
				//Set<String> userMap = new HashSet<String>();
				int page = 0;
				while(true) {
					//PageRequest request = new PageRequest(page, MATCH_PAGE_SIZE, new Sort(sortOrder == Room.RoomSortOrder.RoomSortOrder_ASC ? Direction.ASC : Direction.DESC, sortKey));
					PageRequest request = new PageRequest(page, MATCH_PAGE_SIZE);
					q.with(request);
					List<User> users = mongoOperationsUSER.find(q, User.class);
					if(users.isEmpty() != false) 
						break;
					q = query(where("id").is(room.id));
					for(User u: users) {
						
						mongoOperationsP2P.updateFirst(q, new Update().pull("refUsersKWs", u.id), Room.class);
						//userMap.add(u.id);
					}
					
					
					q = query(where("keywords").in(room.keywords));
					page++;
					//userMap.clear();
				}
				
			}
			
			
			Room room = (Room) argImpl.matchSrc;
			if((room.enabled != false) && ((room.searchMode == SortSearchMode.SortPairMode_ANY) || (room.searchMode == SortSearchMode.SortPairMode_MATCHING))){
				Query q = query(where("keywords").in(room.keywords));
				//Set<String> userMap = new HashSet<String>();
				int page = 0;
				while(true) {
					//PageRequest request = new PageRequest(page, MATCH_PAGE_SIZE, new Sort(sortOrder == Room.RoomSortOrder.RoomSortOrder_ASC ? Direction.ASC : Direction.DESC, sortKey));
					PageRequest request = new PageRequest(page, MATCH_PAGE_SIZE);
					q.with(request);
					List<User> users = mongoOperationsUSER.find(q, User.class);
					if(users.isEmpty() != false) 
						break;
					q = query(where("id").is(room.id));
					for(User u: users) {
						
						mongoOperationsP2P.updateFirst(q, new Update().addToSet("refUsersKWs", u.id), Room.class);
						//userMap.add(u.id);
					}
					
					
					q = query(where("keywords").in(room.keywords));
					page++;
					//userMap.clear();
				}
				
			}
			
			
		}
		
		private void runMatcherRoomFW() {
			MatchFWArgs argImpl = (MatchFWArgs) arg;
			if(argImpl.changed != false) {
				Query q = query(where("userId").is(argImpl.targetId));
				mongoOperationsP2P.updateFirst(q, new Update().pull("refRoomsFW", argImpl.sourceId), Room.class);
			}
			
			Query q = query(where("userId").is(argImpl.targetId));
			mongoOperationsP2P.updateFirst(q, new Update().addToSet("refRoomsFW", argImpl.sourceId), Room.class);
			
		}
		
	}
	
	public void RunMatch(EMatchType mt, IMatchRoot obj, boolean changed) {
		MatchRootArgs arg = new MatchRootArgs();
		arg.matchType = mt;
		arg.changed = changed;
		arg.matchSrc = obj;
		MatchTask task = new MatchTask(arg);
		taskExecutor.execute(task);
	}
	
	public void RunMatch(EMatchType mt, String targetId, String sourceId, boolean changed) {
		MatchFWArgs arg = new MatchFWArgs();
		arg.matchType = mt;
		arg.changed = changed;
		arg.targetId = targetId;
		arg.sourceId = sourceId;
		MatchTask task = new MatchTask(arg);
		taskExecutor.execute(task);
	}
	
	private static abstract class MatchArgs {
		EMatchType matchType;
		
		Boolean changed;
	}
	
	private static class MatchRootArgs extends MatchArgs{
		
		IMatchRoot matchSrc;
		
	}
	
	private static class MatchFWArgs extends MatchArgs{
		
		String targetId;
		String sourceId;
		
	}
}
